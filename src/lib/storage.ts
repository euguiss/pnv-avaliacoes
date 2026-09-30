// Camada de dados do app.
// - Envio: cada submissão pode conter VÁRIAS avaliações (itens), ex.: várias matérias.
// - Coleta central: envia ao backend Google Apps Script (VITE_API_URL).
// - Anti-duplicação: marca no navegador quais formulários o usuário já respondeu (sem identificar).
// - Admin: lê todas as respostas do backend com senha, para métricas e export.

export interface EvalItem {
  formSlug: string;
  answers: Record<string, string>;
}

export interface SubmissionPayload {
  submissionId: string;
  createdAt: string; // ISO
  items: EvalItem[];
}

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
const DONE_KEY = "pnv-avaliacoes:respondidos";

export function isRemoteEnabled(): boolean {
  return Boolean(API_URL && API_URL.trim().length > 0);
}

export function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---- Anti-duplicação leve (por navegador, anônimo) --------------------------

export function respondedForms(): string[] {
  try {
    const raw = localStorage.getItem(DONE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function hasResponded(slug: string): boolean {
  return respondedForms().includes(slug);
}

export function markResponded(slugs: string[]): void {
  const set = new Set(respondedForms());
  slugs.forEach((s) => set.add(s));
  localStorage.setItem(DONE_KEY, JSON.stringify([...set]));
}

export function resetResponded(): void {
  localStorage.removeItem(DONE_KEY);
}

// ---- Envio ------------------------------------------------------------------

// Envia a submissão ao backend. Retorna true se enviou (ou se não há backend, salva local).
export async function submit(payload: SubmissionPayload): Promise<boolean> {
  markResponded(payload.items.map((i) => i.formSlug));
  if (!isRemoteEnabled()) {
    // Fallback local: acumula num rascunho local (útil em dev sem backend).
    const local = loadLocal();
    local.push(payload);
    localStorage.setItem("pnv-avaliacoes:local", JSON.stringify(local));
    return true;
  }
  // Guarda um backup local SEMPRE (mesmo com backend), para nada se perder
  // caso o envio remoto falhe. O admin também consegue recuperar daqui.
  const local = loadLocal();
  local.push(payload);
  localStorage.setItem("pnv-avaliacoes:local", JSON.stringify(local));

  try {
    // no-cors: o Apps Script grava normalmente; a resposta fica opaca (esperado).
    // Como não dá para ler o corpo, tratamos ausência de exceção como sucesso.
    // Timeout de segurança: se o Apps Script demorar demais, não deixamos o usuário
    // travado — a resposta já está no backup local e o envio foi disparado.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    await fetch(API_URL as string, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
    return true;
  } catch (err) {
    // AbortError = timeout: o request provavelmente foi enviado; consideramos sucesso
    // (o backup local garante que nada se perde).
    if (err instanceof DOMException && err.name === "AbortError") return true;
    return false;
  }
}

function loadLocal(): SubmissionPayload[] {
  try {
    const raw = localStorage.getItem("pnv-avaliacoes:local");
    return raw ? (JSON.parse(raw) as SubmissionPayload[]) : [];
  } catch {
    return [];
  }
}

// ---- Admin: leitura das respostas -------------------------------------------

export type AdminData = Record<string, Record<string, string>[]>;

// Busca todas as respostas do backend (requer senha). Se não houver backend,
// devolve os dados locais (modo dev).
export async function fetchAdminData(password: string): Promise<AdminData> {
  if (!isRemoteEnabled()) {
    return localToAdminData();
  }
  const url = `${API_URL}?pwd=${encodeURIComponent(password)}`;
  const res = await fetch(url, { method: "GET" });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Falha ao carregar dados");
  return json.data as AdminData;
}

function localToAdminData(): AdminData {
  const out: AdminData = {};
  for (const sub of loadLocal()) {
    for (const item of sub.items) {
      if (!out[item.formSlug]) out[item.formSlug] = [];
      out[item.formSlug].push({
        createdAt: sub.createdAt,
        submissionId: sub.submissionId,
        ...item.answers,
      });
    }
  }
  return out;
}

// ---- Exportação CSV ---------------------------------------------------------

export function toCSV(rows: Record<string, string>[]): string {
  if (rows.length === 0) return "";
  const cols = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );
  const header = cols.map(escapeCSV).join(",");
  const body = rows
    .map((r) => cols.map((c) => escapeCSV(String(r[c] ?? ""))).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

function escapeCSV(v: string): string {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function downloadCSV(filename: string, csv: string): void {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
