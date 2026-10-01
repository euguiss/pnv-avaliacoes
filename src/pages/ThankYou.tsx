import { Link } from "react-router-dom";
import { CenLogo } from "../components/CenLogo";

export function ThankYou() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <CenLogo className="mx-auto h-16 w-16" />
      <h1 className="mt-6 text-2xl font-bold text-naval-900">Obrigado pela sua contribuição</h1>
      <p className="mt-3 text-slate-600">
        Suas avaliações foram enviadas de forma anônima e vão apoiar o aprimoramento contínuo
        do curso de Engenharia Naval e Oceânica.
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
