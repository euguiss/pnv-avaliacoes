import { Link } from "react-router-dom";
import { CenLogo } from "./CenLogo";

// Barra superior discreta e uniforme, usada nas páginas internas.
export function TopBar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5 text-naval-900">
          <CenLogo className="h-8 w-8" />
          <span className="text-sm font-semibold tracking-tight">
            CEN · Avaliação do Curso
          </span>
        </Link>
      </div>
    </header>
  );
}
