import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FORMS } from "../data/forms";
import type { FormDef } from "../data/forms";
import {
  clearForm,
  downloadCSV,
  submissionsForForm,
  toCSV,
  type Submission,
} from "../lib/storage";

export function Results() {
  const [refresh, setRefresh] = useState(0);
  const [active, setActive] = useState<string>(FORMS[0].slug);
  const form = FORMS.find((f) => f.slug === active)!;

  const subs = useMemo(() => submissionsForForm(active), [active, refresh]);

  function handleExport() {
    const ids = form.questions.map((q) => q.id);
    const csv = toCSV(subs, ids);
    downloadCSV(`pnv-${form.slug}.csv`, csv);
  }

  function handleClear() {
    if (confirm(`Apagar todas as ${subs.length} respostas de "${form.short}"? Esta ação não pode ser desfeita.`)) {
      clearForm(active);
      setRefresh((r) => r + 1);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/" className="text-sm text-naval-600 hover:underline">
        ← Início
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-naval-900">Resultados</h1>
      <p className="mt-1 text-sm text-slate-500">
        Médias e comentários das respostas coletadas neste navegador.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FORMS.map((f) => (
          <button
            key={f.slug}
            onClick={() => setActive(f.slug)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              active === f.slug
                ? "bg-naval-800 text-white"
                : "bg-white border border-slate-300 text-slate-600 hover:border-naval-600"
            }`}
          >
            {f.icon} {f.short}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <p className="text-sm text-slate-500">Total de respostas</p>
          <p className="text-2xl font-bold text-naval-900">{subs.length}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={subs.length === 0}
            className="rounded-lg bg-naval-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-naval-700 disabled:opacity-40"
          >
            ⬇ Exportar CSV
          </button>
          <button
            onClick={handleClear}
            disabled={subs.length === 0}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-40"
          >
            Limpar
          </button>
        </div>
      </div>

      {subs.length === 0 ? (
        <p className="mt-8 text-center text-slate-500">
          Ainda não há respostas para este formulário.
        </p>
      ) : (
        <RatingSummary form={form} subs={subs} />
      )}
    </div>
  );
}

function RatingSummary({ form, subs }: { form: FormDef; subs: Submission[] }) {
  const rated = form.questions.filter((q) => q.type === "likert" || q.type === "nps");
  const textQs = form.questions.filter((q) => q.type === "textarea" || q.type === "text");

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Médias das notas
        </h2>
        <div className="mt-4 space-y-3">
          {rated.map((q) => {
            const values = subs
              .map((s) => Number(s.answers[q.id]))
              .filter((n) => !Number.isNaN(n));
            const avg =
              values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            const max = q.type === "nps" ? 10 : 5;
            const pct = (avg / max) * 100;
            return (
              <div key={q.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{q.label}</span>
                  <span className="font-semibold text-naval-800">
                    {values.length ? avg.toFixed(1) : "—"}
                    <span className="text-xs font-normal text-slate-400">/{max}</span>
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-naval-600"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-400">{values.length} respostas</span>
              </div>
            );
          })}
        </div>
      </section>

      {textQs.map((q) => {
        const comments = subs
          .map((s) => s.answers[q.id])
          .filter((c) => c && c.trim().length > 0);
        if (comments.length === 0) return null;
        return (
          <section key={q.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-700">{q.label}</h2>
            <ul className="mt-3 space-y-2">
              {comments.map((c, i) => (
                <li
                  key={i}
                  className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600"
                >
                  “{c}”
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
