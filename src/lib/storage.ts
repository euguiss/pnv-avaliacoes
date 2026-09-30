// Camada de persistência: as respostas ficam salvas no localStorage do navegador.
// Simples e sem backend — ideal para postar o link e coletar respostas localmente,
// depois exportar em CSV para consolidar.

export interface Submission {
  id: string;
  formSlug: string;
  createdAt: string; // ISO
  answers: Record<string, string>;
}

const KEY = "pnv-avaliacoes:submissions";

export function loadSubmissions(): Submission[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Submission[];
  } catch {
    return [];
  }
}

export function saveSubmission(sub: Submission): void {
  const all = loadSubmissions();
  all.push(sub);
  localStorage.setItem(KEY, JSON.stringify(all));
}

// Endpoint remoto opcional para coleta centralizada (Google Apps Script, Supabase, etc.).
// Configure em .env como VITE_API_URL. Se vazio, o app funciona 100% local.
const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export function isRemoteEnabled(): boolean {
  return Boolean(API_URL && API_URL.trim().length > 0);
}

// Envia a resposta ao backend remoto (se configurado). Não bloqueia o fluxo local:
// a resposta já foi salva localmente por saveSubmission.
export async function syncSubmission(sub: Submission): Promise<boolean> {
  if (!isRemoteEnabled()) return false;
  try {
    await fetch(API_URL as string, {
      method: "POST",
      // text/plain evita preflight CORS no Google Apps Script
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(sub),
    });
    return true;
  } catch {
    return false;
  }
}

export function submissionsForForm(slug: string): Submission[] {
  return loadSubmissions().filter((s) => s.formSlug === slug);
}

export function clearForm(slug: string): void {
  const remaining = loadSubmissions().filter((s) => s.formSlug !== slug);
  localStorage.setItem(KEY, JSON.stringify(remaining));
}

export function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Exporta as respostas de um formulário como CSV.
export function toCSV(subs: Submission[], questionIds: string[]): string {
  const header = ["id", "data", ...questionIds];
  const rows = subs.map((s) => {
    const cells = [s.id, s.createdAt, ...questionIds.map((q) => s.answers[q] ?? "")];
    return cells.map(escapeCSV).join(",");
  });
  return [header.map(escapeCSV).join(","), ...rows].join("\n");
}

function escapeCSV(value: string): string {
  const v = String(value ?? "");
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
