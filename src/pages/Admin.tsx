import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FORMS } from "../data/forms";
import type { FormDef } from "../data/forms";
import { fetchAdminData, downloadCSV, toCSV, type AdminData } from "../lib/storage";
import { computeGroups, overallScore, type GroupStat, type QuestionStat } from "../lib/metrics";

const ADMIN_PASSWORD = "1120";

export function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeForm, setActiveForm] = useState(FORMS[0].slug);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (pwd !== ADMIN_PASSWORD) {
      setError("Senha incorreta.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const d = await fetchAdminData(pwd);
      setData(d);
      setAuthed(true);
    } catch (err) {
      setError("Falha ao carregar dados. " + (err instanceof Error ? err.message : ""));
    } finally {
      setLoading(false);
    }
  }

  if (!authed) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-24">
        <div className="mb-4 text-4xl">🔒</div>
        <h1 className="text-xl font-bold text-naval-900">Painel Administrativo</h1>
        <p className="mt-1 text-sm text-slate-500">Acesso restrito.</p>
        <form onSubmit={login} className="mt-6 w-full space-y-3">
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Senha"
            autoFocus
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-naval-600 focus:outline-none focus:ring-2 focus:ring-naval-100"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-naval-800 py-2.5 text-sm font-semibold text-white hover:bg-naval-900 disabled:opacity-50"
          >
            {loading ? "Carregando…" : "Entrar"}
          </button>
        </form>
        <Link to="/" className="mt-6 text-xs text-slate-400 hover:underline">
          ← Voltar ao app
        </Link>
      </div>
    );
  }

  return (
    <AdminDashboard
      data={data!}
      activeForm={activeForm}
      setActiveForm={setActiveForm}
      onReload={async () => setData(await fetchAdminData(pwd))}
    />
  );
}

function AdminDashboard({
  data,
  activeForm,
  setActiveForm,
  onReload,
}: {
  data: AdminData;
  activeForm: string;
  setActiveForm: (s: string) => void;
  onReload: () => void;
}) {
  const form = FORMS.find((f) => f.slug === activeForm)!;
  const rows = useMemo(() => data[activeForm] || [], [data, activeForm]);
  const groups = useMemo(() => computeGroups(form, rows), [form, rows]);
  const [selectedGroup, setSelectedGroup] = useState<string>("__all__");
  const [view, setView] = useState<"detalhado" | "comparativo">("detalhado");

  const visibleGroups =
    selectedGroup === "__all__" ? groups : groups.filter((g) => g.key === selectedGroup);

  function exportForm() {
    downloadCSV(`pnv-${activeForm}.csv`, toCSV(rows));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-naval-900">Painel Administrativo</h1>
          <p className="text-sm text-slate-500">Métricas e respostas das avaliações (anônimas).</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReload}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            ↻ Atualizar
          </button>
          <Link to="/" className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            Sair
          </Link>
        </div>
      </div>

      {/* Abas de formulário */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FORMS.map((f) => {
          const n = (data[f.slug] || []).length;
          return (
            <button
              key={f.slug}
              onClick={() => {
                setActiveForm(f.slug);
                setSelectedGroup("__all__");
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeForm === f.slug
                  ? "bg-naval-800 text-white"
                  : "border border-slate-300 bg-white text-slate-600 hover:border-naval-600"
              }`}
            >
              {f.short} <span className="opacity-70">({n})</span>
            </button>
          );
        })}
      </div>

      {/* Barra de ações + seletor de item */}
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <p className="text-xs text-slate-500">Total de avaliações</p>
          <p className="text-2xl font-bold text-naval-900">{rows.length}</p>
        </div>

        {form.groupBy && groups.length > 0 && (
          <div className="ml-2">
            <label className="block text-xs text-slate-500">
              {form.slug === "materias" ? "Filtrar por matéria" : form.slug === "professores" ? "Filtrar por docente" : "Filtrar"}
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="mt-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            >
              <option value="__all__">Todos ({groups.length})</option>
              {groups.map((g) => (
                <option key={g.key} value={g.key}>
                  {g.key} ({g.total})
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={exportForm}
          disabled={rows.length === 0}
          className="ml-auto rounded-lg bg-naval-600 px-4 py-2 text-sm font-medium text-white hover:bg-naval-700 disabled:opacity-40"
        >
          ⬇ Exportar CSV
        </button>
      </div>

      {/* Alternância de visualização (só faz sentido com agrupamento) */}
      {form.groupBy && groups.length > 1 && (
        <div className="mt-6 inline-flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setView("detalhado")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              view === "detalhado" ? "bg-naval-800 text-white" : "text-slate-600 hover:text-naval-700"
            }`}
          >
            Detalhado
          </button>
          <button
            onClick={() => setView("comparativo")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              view === "comparativo" ? "bg-naval-800 text-white" : "text-slate-600 hover:text-naval-700"
            }`}
          >
            Comparativo
          </button>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="mt-10 text-center text-slate-500">Ainda não há respostas para este formulário.</p>
      ) : form.groupBy && groups.length > 1 && view === "comparativo" ? (
        <Comparativo
          form={form}
          groups={groups}
          label={form.slug === "professores" ? "docente" : "disciplina"}
        />
      ) : (
        <div className="mt-6 space-y-6">
          {form.groupBy && selectedGroup === "__all__" && groups.length > 1 && (
            <Ranking groups={groups} label={form.slug === "professores" ? "docente" : "item"} />
          )}
          {visibleGroups.map((g) => (
            <GroupCard key={g.key} group={g} showTitle={Boolean(form.groupBy)} />
          ))}
        </div>
      )}
    </div>
  );
}

function Ranking({ groups, label }: { groups: GroupStat[]; label: string }) {
  const ranked = [...groups]
    .map((g) => ({ key: g.key, score: overallScore(g), total: g.total }))
    .filter((g) => g.score > 0)
    .sort((a, b) => b.score - a.score);
  if (ranked.length === 0) return null;

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Ranking por nota geral ({label})
      </h2>
      <div className="mt-4 space-y-2">
        {ranked.map((r, i) => (
          <div key={r.key} className="flex items-center gap-2 sm:gap-3">
            <span className="w-5 shrink-0 text-right text-sm font-semibold text-slate-400">{i + 1}</span>
            <span className="w-28 shrink-0 truncate text-sm text-slate-700 sm:w-52" title={r.key}>
              {r.key}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-naval-600" style={{ width: `${(r.score / 5) * 100}%` }} />
            </div>
            <span className="w-14 shrink-0 text-right text-sm font-semibold text-naval-800 sm:w-16">
              {r.score.toFixed(2)}
              <span className="hidden text-xs font-normal text-slate-400 sm:inline"> ({r.total})</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// Visão comparativa: compara todos os itens (matérias/professores) por nota geral
// OU por uma pergunta específica, lado a lado, com gráfico de barras ordenado.
function Comparativo({
  form,
  groups,
  label,
}: {
  form: FormDef;
  groups: GroupStat[];
  label: string;
}) {
  // Perguntas de nota disponíveis para comparar (likert/nps).
  const ratedQuestions = form.questions.filter((q) => q.type === "likert" || q.type === "nps");
  const [metric, setMetric] = useState<string>("__overall__");

  const isOverall = metric === "__overall__";
  const max = isOverall ? 5 : ratedQuestions.find((q) => q.id === metric)?.type === "nps" ? 10 : 5;

  // Monta linhas: { nome, valor, n }
  const data = groups
    .map((g) => {
      if (isOverall) {
        return { key: g.key, value: overallScore(g), n: g.total };
      }
      const stat = g.stats.find((s) => s.question.id === metric);
      return { key: g.key, value: stat?.count ? stat.avg : 0, n: stat?.count ?? 0 };
    })
    .filter((d) => d.n > 0)
    .sort((a, b) => b.value - a.value);

  const media = data.length ? data.reduce((a, d) => a + d.value, 0) / data.length : 0;

  function exportComparativo() {
    const rows = data.map((d) => ({
      [label]: d.key,
      nota: d.value.toFixed(2),
      respostas: String(d.n),
    }));
    downloadCSV(`pnv-comparativo-${form.slug}-${isOverall ? "geral" : metric}.csv`, toCSV(rows));
  }

  const metricName = isOverall
    ? "Nota geral"
    : ratedQuestions.find((q) => q.id === metric)?.label ?? "";

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex-1">
          <label className="block text-xs text-slate-500">Comparar por</label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-auto"
          >
            <option value="__overall__">Nota geral (média)</option>
            {ratedQuestions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.label}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-lg bg-naval-50 px-3 py-2 text-center">
          <p className="text-xs text-naval-600">Média entre {label}s</p>
          <p className="text-lg font-bold text-naval-800">{media.toFixed(2)}<span className="text-xs font-normal text-slate-400">/{max}</span></p>
        </div>
        <button
          onClick={exportComparativo}
          className="ml-auto rounded-lg bg-naval-600 px-4 py-2 text-sm font-medium text-white hover:bg-naval-700"
        >
          ⬇ Exportar comparativo
        </button>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-700">{metricName}</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          {data.length} {label}{data.length === 1 ? "" : "s"} com respostas · ordenado da maior para a menor nota
        </p>
        <div className="mt-4 space-y-2.5">
          {data.map((d) => {
            const pct = (d.value / max) * 100;
            // Cor: acima da média = azul; abaixo = âmbar/vermelho suave.
            const aboveAvg = d.value >= media;
            return (
              <div key={d.key} className="flex items-center gap-2 sm:gap-3">
                <span className="w-28 shrink-0 truncate text-sm text-slate-700 sm:w-56" title={d.key}>
                  {d.key}
                </span>
                <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-slate-100">
                  <div
                    className={`h-full rounded-md ${aboveAvg ? "bg-naval-600" : "bg-amber-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                  {/* Linha da média */}
                  <div
                    className="absolute top-0 h-full border-l-2 border-dashed border-slate-400"
                    style={{ left: `${(media / max) * 100}%` }}
                    title={`Média: ${media.toFixed(2)}`}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-sm font-semibold text-naval-800">
                  {d.value.toFixed(2)}
                  <span className="hidden text-xs font-normal text-slate-400 sm:inline"> ({d.n})</span>
                </span>
              </div>
            );
          })}
          {data.length === 0 && (
            <p className="text-sm text-slate-500">Sem dados suficientes para comparar.</p>
          )}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="h-2.5 w-4 rounded bg-naval-600" /> Acima da média</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-4 rounded bg-amber-500" /> Abaixo da média</span>
          <span className="flex items-center gap-1"><span className="h-3 border-l-2 border-dashed border-slate-400" /> Média geral</span>
        </div>
      </section>
    </div>
  );
}

function GroupCard({ group, showTitle }: { group: GroupStat; showTitle: boolean }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      {showTitle && (
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-semibold text-naval-900">{group.key}</h2>
          <span className="rounded-full bg-naval-50 px-3 py-1 text-xs font-medium text-naval-700">
            {group.total} {group.total === 1 ? "avaliação" : "avaliações"}
          </span>
        </div>
      )}

      <div className="space-y-4">
        {group.stats.map((s) => (
          <StatRow key={s.question.id} stat={s} />
        ))}
      </div>

      {group.comments.length > 0 && (
        <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
          {group.comments.map((c) => (
            <div key={c.question.id}>
              <p className="text-sm font-medium text-slate-700">{c.question.label}</p>
              <ul className="mt-2 space-y-1.5">
                {c.texts.map((t, i) => (
                  <li key={i} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    “{t}”
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// Linha de métrica individual: média + mini-gráfico de distribuição de notas.
function StatRow({ stat }: { stat: QuestionStat }) {
  const pct = stat.count ? (stat.avg / stat.max) * 100 : 0;
  const buckets = stat.max === 10 ? [0,1,2,3,4,5,6,7,8,9,10] : [1, 2, 3, 4, 5];
  const maxBucket = Math.max(1, ...buckets.map((b) => stat.distribution[String(b)] || 0));

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-700">{stat.question.label}</span>
        <span className="font-semibold text-naval-800">
          {stat.count ? stat.avg.toFixed(2) : "—"}
          <span className="text-xs font-normal text-slate-400">/{stat.max}</span>
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-naval-600" style={{ width: `${pct}%` }} />
      </div>
      {/* Distribuição de notas (histograma) */}
      <div className="mt-2 flex items-end gap-1" style={{ height: 40 }}>
        {buckets.map((b) => {
          const c = stat.distribution[String(b)] || 0;
          const h = (c / maxBucket) * 100;
          return (
            <div key={b} className="flex flex-1 flex-col items-center" title={`Nota ${b}: ${c} resposta(s)`}>
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t bg-naval-300"
                  style={{ height: `${h}%`, minHeight: c > 0 ? 3 : 0 }}
                />
              </div>
              <span className="mt-0.5 text-[10px] text-slate-400">{b}</span>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-400">{stat.count} respostas</p>
    </div>
  );
}
