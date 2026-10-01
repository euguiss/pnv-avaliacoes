// Logotipo do CEN (Centro de Engenharia Naval) — combina elementos navais (leme de navio)
// e de engenharia (engrenagem), em um emblema circular limpo e profissional.
export function CenLogo({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Logotipo do Centro de Engenharia Naval (CEN)"
    >
      {/* Fundo circular */}
      <circle cx="50" cy="50" r="48" fill="#0f2d54" />
      <circle cx="50" cy="50" r="48" fill="none" stroke="#1a4d8f" strokeWidth="2" />

      {/* Engrenagem (engenharia) — anel externo com dentes */}
      <g fill="#2f6bb3">
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x = 50 + Math.cos(angle) * 38;
          const y = 50 + Math.sin(angle) * 38;
          return (
            <rect
              key={i}
              x={x - 3}
              y={y - 3}
              width="6"
              height="6"
              rx="1"
              transform={`rotate(${i * 30} ${x} ${y})`}
            />
          );
        })}
      </g>
      <circle cx="50" cy="50" r="34" fill="#0f2d54" stroke="#2f6bb3" strokeWidth="2" />

      {/* Leme de navio (naval) — timão com raios */}
      <g stroke="#dbe8f7" strokeWidth="2.5" fill="none">
        <circle cx="50" cy="50" r="16" />
        <circle cx="50" cy="50" r="6" fill="#dbe8f7" />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const x1 = 50 + Math.cos(angle) * 10;
          const y1 = 50 + Math.sin(angle) * 10;
          const x2 = 50 + Math.cos(angle) * 22;
          const y2 = 50 + Math.sin(angle) * 22;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
    </svg>
  );
}
