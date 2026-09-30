import { Link } from "react-router-dom";
import { FORMS } from "../data/forms";
import { submissionsForForm } from "../lib/storage";

export function Home() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-naval-800 text-3xl">
          ⚓
        </div>
        <h1 className="text-2xl font-bold text-naval-900 sm:text-3xl">
          Avaliações do Departamento PNV
        </h1>
        <p className="mt-2 text-slate-600">
          Engenharia Naval e Oceânica · Escola Politécnica da USP
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
          Sua opinião ajuda a melhorar o curso. Todas as respostas são anônimas.
          Escolha um formulário abaixo para começar.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {FORMS.map((form) => {
          const count = submissionsForForm(form.slug).length;
          return (
            <Link
              key={form.slug}
              to={`/form/${form.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl">{form.icon}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                  {count} {count === 1 ? "resposta" : "respostas"}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-naval-900 group-hover:text-naval-700">
                {form.short}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{form.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-naval-600">
                Responder →
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/resultados"
          className="inline-flex items-center gap-2 rounded-lg border border-naval-600 px-5 py-2.5 text-sm font-medium text-naval-700 transition hover:bg-naval-50"
        >
          📊 Ver resultados e exportar dados
        </Link>
      </div>

      <footer className="mt-12 text-center text-xs text-slate-400">
        Respostas salvas localmente no navegador · Exporte em CSV no painel de resultados
      </footer>
    </div>
  );
}
