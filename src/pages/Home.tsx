import { Link } from "react-router-dom";
import { FORMS } from "../data/forms";
import { hasResponded, resetResponded } from "../lib/storage";

export function Home() {
  const alreadyDone = FORMS.every((f) => hasResponded(f.slug));

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
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
      </header>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-slate-600">
          Sua opinião ajuda a melhorar o curso. Em poucos minutos você avalia:
        </p>
        <ul className="mt-4 space-y-2">
          {FORMS.map((f) => (
            <li key={f.slug} className="flex items-center gap-3 text-sm text-slate-700">
              <span className="text-xl">{f.icon}</span>
              <span>
                <strong>{f.short}</strong> — {f.description}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-lg bg-naval-50 px-4 py-3 text-sm text-naval-800">
          🔒 Totalmente <strong>anônimo</strong>. Você pode avaliar várias matérias e vários
          professores de uma vez — inclusive de semestres anteriores.
        </div>
      </div>

      {alreadyDone ? (
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Você já enviou suas avaliações neste dispositivo. Obrigado! 🙌
          </p>
          <button
            onClick={() => {
              if (confirm("Deseja responder novamente? Isso permitirá um novo envio.")) {
                resetResponded();
                location.reload();
              }
            }}
            className="mt-3 text-xs text-naval-600 underline"
          >
            Quero responder de novo
          </button>
        </div>
      ) : (
        <div className="mt-8 text-center">
          <Link
            to="/avaliar"
            className="inline-flex items-center gap-2 rounded-xl bg-naval-800 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-naval-900"
          >
            Começar avaliação →
          </Link>
        </div>
      )}

      <footer className="mt-12 text-center text-xs text-slate-400">
        Departamento de Engenharia Naval e Oceânica — Poli-USP
      </footer>
    </div>
  );
}
