import type { FormDef, Question } from "../data/forms";
import { NAO_SE_APLICA, MULTI_SEP } from "../data/forms";

export interface QuestionStat {
  question: Question;
  avg: number;
  count: number; // respostas numéricas válidas (exclui N/A)
  na: number; // nº de "Não se aplica / Não conheço"
  max: number;
  distribution: Record<string, number>; // valor -> nº de respostas (para likert/nps)
}

// Estatística para perguntas categóricas (radio/select): proporção por opção.
export interface CategoryStat {
  question: Question;
  total: number; // nº de respostas
  counts: { label: string; count: number; pct: number }[]; // ordenado por contagem desc
  multi?: boolean; // true para multiseleção (pct = % dos respondentes; pode somar >100%)
}

export interface GroupStat {
  key: string; // ex.: nome da matéria/professor (ou "Geral")
  total: number; // nº de avaliações neste grupo
  stats: QuestionStat[]; // uma entrada por pergunta com nota
  categories: CategoryStat[]; // uma entrada por pergunta radio/select
  comments: { question: Question; texts: string[] }[];
}

const RATED = new Set(["likert", "nps"]);
const TEXTUAL = new Set(["text", "textarea"]);
const CATEGORICAL = new Set(["radio", "select"]);
const MULTI = new Set(["multiselect"]);

// Calcula estatísticas para um conjunto de linhas (respostas) de um formulário.
function computeStats(form: FormDef, rows: Record<string, string>[]): {
  stats: QuestionStat[];
  categories: CategoryStat[];
  comments: { question: Question; texts: string[] }[];
} {
  const stats: QuestionStat[] = [];
  const categories: CategoryStat[] = [];
  const comments: { question: Question; texts: string[] }[] = [];

  for (const q of form.questions) {
    if (RATED.has(q.type)) {
      const raw = rows
        .map((r) => r[q.id])
        .filter((v) => v !== undefined && v !== null && String(v).trim() !== "");
      // Respostas "Não se aplica" são contadas à parte e excluídas da média.
      const na = raw.filter((v) => String(v) === NAO_SE_APLICA).length;
      const valid = raw
        .filter((v) => String(v) !== NAO_SE_APLICA)
        .map(Number)
        .filter((n) => !Number.isNaN(n));
      const avg = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
      const distribution: Record<string, number> = {};
      valid.forEach((n) => {
        distribution[String(n)] = (distribution[String(n)] || 0) + 1;
      });
      stats.push({
        question: q,
        avg,
        count: valid.length,
        na,
        max: q.type === "nps" ? 10 : 5,
        distribution,
      });
    } else if (CATEGORICAL.has(q.type)) {
      const vals = rows
        .map((r) => r[q.id])
        .filter((v) => v && String(v).trim().length > 0)
        .map(String);
      if (vals.length > 0) {
        const map = new Map<string, number>();
        vals.forEach((v) => map.set(v, (map.get(v) || 0) + 1));
        // Mantém a ordem das opções definidas na pergunta; opções não previstas vão ao fim.
        const defined = q.options ?? [];
        const extras = [...map.keys()].filter((k) => !defined.includes(k));
        const ordered = [...defined, ...extras].filter((label) => map.has(label));
        const counts = ordered.map((label) => ({
          label,
          count: map.get(label)!,
          pct: (map.get(label)! / vals.length) * 100,
        }));
        categories.push({ question: q, total: vals.length, counts });
      }
    } else if (MULTI.has(q.type)) {
      // Multiseleção (ex.: disciplinas lecionadas por um docente): divide cada
      // resposta pelo separador e conta quantos RESPONDENTES citaram cada opção.
      // O total é o nº de respondentes; a % é "% dos respondentes" (pode somar >100%).
      const respondents = rows
        .map((r) => r[q.id])
        .filter((v) => v && String(v).trim().length > 0)
        .map((v) => String(v).split(MULTI_SEP).map((s) => s.trim()).filter(Boolean));
      if (respondents.length > 0) {
        const map = new Map<string, number>();
        respondents.forEach((items) => {
          // Conta cada opção uma vez por respondente (dedup dentro da mesma resposta).
          new Set(items).forEach((label) => map.set(label, (map.get(label) || 0) + 1));
        });
        const counts = [...map.entries()]
          .map(([label, count]) => ({
            label,
            count,
            pct: (count / respondents.length) * 100,
          }))
          .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "pt-BR"));
        categories.push({ question: q, total: respondents.length, counts, multi: true });
      }
    } else if (TEXTUAL.has(q.type)) {
      const texts = rows
        .map((r) => r[q.id])
        .filter((t) => t && String(t).trim().length > 0)
        .map(String);
      if (texts.length > 0) comments.push({ question: q, texts });
    }
  }
  return { stats, categories, comments };
}

// Agrupa as respostas por groupBy (matéria/professor) e calcula métricas por grupo.
// Se o form não tem groupBy, devolve um único grupo "Geral".
export function computeGroups(form: FormDef, rows: Record<string, string>[]): GroupStat[] {
  if (!form.groupBy) {
    const { stats, categories, comments } = computeStats(form, rows);
    return [{ key: "Geral", total: rows.length, stats, categories, comments }];
  }

  const byKey = new Map<string, Record<string, string>[]>();
  for (const row of rows) {
    const key = (row[form.groupBy] || "—").toString();
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(row);
  }

  const groups: GroupStat[] = [];
  for (const [key, groupRows] of byKey) {
    const { stats, categories, comments } = computeStats(form, groupRows);
    groups.push({ key, total: groupRows.length, stats, categories, comments });
  }
  // Ordena por nome
  groups.sort((a, b) => a.key.localeCompare(b.key, "pt-BR"));
  return groups;
}

// Nota geral média de um grupo (média das médias das perguntas likert "geral" ou de todas).
export function overallScore(group: GroupStat): number {
  const geral = group.stats.find((s) => s.question.id === "geral");
  if (geral && geral.count > 0) return geral.avg;
  const likerts = group.stats.filter((s) => s.max === 5 && s.count > 0);
  if (likerts.length === 0) return 0;
  return likerts.reduce((a, s) => a + s.avg, 0) / likerts.length;
}

// ---- Resumo executivo -------------------------------------------------------

export interface Highlight {
  label: string;
  avg: number;
  max: number;
  count: number;
}

export interface ExecutiveSummary {
  total: number;
  overall: number; // nota geral média do conjunto
  strengths: Highlight[]; // perguntas com maior média
  weaknesses: Highlight[]; // perguntas com menor média
}

// Resumo rápido para leitura em segundos: nota geral + top pontos fortes/fracos.
// Considera apenas perguntas likert (escala 1–5) com respostas suficientes.
export function executiveSummary(
  form: FormDef,
  rows: Record<string, string>[],
  minCount = 1
): ExecutiveSummary {
  const { stats } = computeStats(form, rows);
  const likerts = stats
    .filter((s) => s.max === 5 && s.count >= minCount && s.question.id !== "geral")
    .map((s) => ({ label: s.question.label, avg: s.avg, max: s.max, count: s.count }));

  const sorted = [...likerts].sort((a, b) => b.avg - a.avg);
  const geral = stats.find((s) => s.question.id === "geral");
  const overall =
    geral && geral.count > 0
      ? geral.avg
      : likerts.length
        ? likerts.reduce((a, h) => a + h.avg, 0) / likerts.length
        : 0;

  return {
    total: rows.length,
    overall,
    strengths: sorted.slice(0, 3),
    weaknesses: sorted.slice(-3).reverse(),
  };
}

// ---- Segmentação por dimensão (ex.: ano do curso) ---------------------------

export interface Segment {
  key: string; // valor da dimensão (ex.: "1º ano")
  total: number;
  overall: number;
}

// Agrupa as respostas por uma pergunta de segmentação (segmentBy) e devolve a
// nota geral de cada segmento — permite comparar coortes (ex.: experiência por ano).
export function segmentByQuestion(
  form: FormDef,
  rows: Record<string, string>[],
  questionId: string
): Segment[] {
  const byKey = new Map<string, Record<string, string>[]>();
  for (const row of rows) {
    const key = (row[questionId] || "—").toString();
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(row);
  }
  const segments: Segment[] = [];
  for (const [key, segRows] of byKey) {
    const summary = executiveSummary(form, segRows);
    segments.push({ key, total: segRows.length, overall: summary.overall });
  }
  // Ordena pela ordem das opções definidas na pergunta de segmentação, se houver.
  const q = form.questions.find((qq) => qq.id === questionId);
  const order = q?.options ?? [];
  segments.sort((a, b) => {
    const ia = order.indexOf(a.key);
    const ib = order.indexOf(b.key);
    if (ia === -1 && ib === -1) return a.key.localeCompare(b.key, "pt-BR");
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  return segments;
}

// Encontra a primeira pergunta marcada como dimensão de segmentação, se existir.
export function segmentQuestion(form: FormDef): Question | undefined {
  return form.questions.find((q) => q.segmentBy);
}
