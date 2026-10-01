import { Link } from "react-router-dom";
import { FORMS } from "../data/forms";
import { hasResponded, resetResponded } from "../lib/storage";
import { CenLogo } from "../components/CenLogo";

export function Home() {
  const alreadyDone = FORMS.every((f) => hasResponded(f.slug));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <header className="text-center">
        <CenLogo className="mx-auto h-20 w-20" />
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-naval-900 sm:text-3xl">
          Avaliação do Curso de Engenharia Naval e Oceânica
        </h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Uma iniciativa do Centro de Engenharia Naval (CEN) da Escola Politécnica da USP
        </p>
      </header>

      <p className="mx-auto mt-8 max-w-xl text-center text-slate-600">
        Contribua com seu feedback para o aprimoramento contínuo da graduação. Selecione uma
        área para iniciar sua avaliação:
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {FORMS.map((form) => (
          <Link
            key={form.slug}
            to="/avaliar"
            className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-naval-600 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-naval-900">{form.short}</h2>
              <span className={`h-2.5 w-2.5 rounded-full ${form.accent}`} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{form.card}</p>
          </Link>
        ))}
      </div>

      {alreadyDone ? (
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Você já enviou suas avaliações neste dispositivo. Obrigado pela contribuição.
          </p>
          <button
            onClick={() => {
              if (confirm("Deseja responder novamente? Isso permitirá um novo envio.")) {
                resetResponded();
                location.reload();
              }
            }}
            className="mt-2 text-xs text-naval-600 underline"
          >
            Responder novamente
          </button>
        </div>
      ) : (
        <div className="mt-8 text-center">
          <Link
            to="/avaliar"
            className="inline-flex items-center gap-2 rounded-lg bg-naval-800 px-8 py-3 text-base font-semibold text-white transition hover:bg-naval-900"
          >
            Iniciar avaliação
          </Link>
        </div>
      )}

      <div className="mx-auto mt-10 max-w-xl rounded-lg border border-slate-200 bg-slate-50 px-5 py-3 text-center text-sm text-slate-600">
        Todas as respostas são tratadas de forma estritamente anônima e confidencial pelo CEN.
      </div>

      <footer className="mt-10 text-center text-xs text-slate-400">
        <p>Centro de Engenharia Naval (CEN) — Escola Politécnica da USP</p>
        <Link to="/admin" className="mt-2 inline-block text-slate-300 hover:text-naval-600 hover:underline">
          Acesso administrativo
        </Link>
      </footer>
    </div>
  );
}
