import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { EvalItem } from "./storage";

// Guarda todas as avaliações que o aluno preencheu durante a sessão,
// para enviar tudo de uma vez no final (envio único).
interface SessionState {
  items: EvalItem[];
  addItem: (item: EvalItem) => void;
  itemsForForm: (slug: string) => EvalItem[];
  clear: () => void;
}

const Ctx = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<EvalItem[]>([]);

  const value = useMemo<SessionState>(
    () => ({
      items,
      addItem: (item) => setItems((prev) => [...prev, item]),
      itemsForForm: (slug) => items.filter((i) => i.formSlug === slug),
      clear: () => setItems([]),
    }),
    [items]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
