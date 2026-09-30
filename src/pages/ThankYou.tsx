import { Link } from "react-router-dom";

export function ThankYou() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl">
        ✅
      </div>
      <h1 className="text-2xl font-bold text-naval-900">Obrigado pela sua participação!</h1>
      <p className="mt-3 text-slate-600">
        Suas avaliações foram enviadas de forma anônima e vão ajudar a melhorar o curso de
        Engenharia Naval e Oceânica.
      </p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-lg border border-naval-600 px-6 py-2.5 text-sm font-medium text-naval-700 hover:bg-naval-50"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
