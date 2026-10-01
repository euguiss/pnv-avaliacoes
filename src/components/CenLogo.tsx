// Logotipo do CEN (Centro de Engenharia Naval) — imagem oficial servida de public/.
// Usa import.meta.env.BASE_URL para funcionar tanto em dev ("/") quanto no deploy
// do GitHub Pages ("/pnv-avaliacoes/").
export function CenLogo({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}cen-logo.png`}
      className={`${className} object-contain`}
      alt="Logotipo do Centro de Engenharia Naval (CEN)"
    />
  );
}
