import type { FormDef, Question } from "../data/forms";

export interface QuestionStat {
  question: Question;
  avg: number;
  count: number;
  max: number;
  distribution: Record<string, number>; // valor -> nº de respostas (para likert/nps)
}

export interface GroupStat {
  key: string; // ex.: nome da matéria/professor (ou "Geral")
  total: number; // nº de avaliações neste grupo
  stats: QuestionStat[]; // uma entrada por pergunta com nota
  comments: { question: Question; texts: string[] }[];
}

const RATED = new Set(["likert", "nps"]);
const TEXTUAL = new Set(["text", "textarea"]);

// Calcula estatísticas para um conjunto de linhas (respostas) de um formulário.
function computeStats(form: FormDef, rows: Record<string, string>[]): {
  stats: QuestionStat[];
  comments: { question: Question; texts: string[] }[];
} {
  const stats: QuestionStat[] = [];
  const comments: { question: Question; texts: string[] }[] = [];

  for (const q of form.questions) {
    if (RATED.has(q.type)) {
      const valid = rows
        .map((r) => r[q.id])
        .filter((v) => v !== undefined && v !== null && String(v).trim() !== "")
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
        max: q.type === "nps" ? 10 : 5,
        distribution,
      });
    } else if (TEXTUAL.has(q.type)) {
      const texts = rows
        .map((r) => r[q.id])
        .filter((t) => t && String(t).trim().length > 0)
        .map(String);
      if (texts.length > 0) comments.push({ question: q, texts });
    }
  }
  return { stats, comments };
}

// Agrupa as respostas por groupBy (matéria/professor) e calcula métricas por grupo.
// Se o form não tem groupBy, devolve um único grupo "Geral".
export function computeGroups(form: FormDef, rows: Record<string, string>[]): GroupStat[] {
  if (!form.groupBy) {
    const { stats, comments } = computeStats(form, rows);
    return [{ key: "Geral", total: rows.length, stats, comments }];
  }

  const byKey = new Map<string, Record<string, string>[]>();
  for (const row of rows) {
    const key = (row[form.groupBy] || "—").toString();
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(row);
  }

  const groups: GroupStat[] = [];
  for (const [key, groupRows] of byKey) {
    const { stats, comments } = computeStats(form, groupRows);
    groups.push({ key, total: groupRows.length, stats, comments });
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
