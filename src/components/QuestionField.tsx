import { useState } from "react";
import type { Question } from "../data/forms";
import { LIKERT_LABELS, NAO_SE_APLICA } from "../data/forms";

// Botão "Não se aplica / Não conheço" — exibido abaixo das escalas quando allowNA.
// Respostas marcadas como N/A não entram na média (ver metrics.ts).
function NAButton({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const active = value === NAO_SE_APLICA;
  return (
    <button
      type="button"
      onClick={() => onChange(active ? "" : NAO_SE_APLICA)}
      className={`mt-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-slate-500 bg-slate-600 text-white"
          : "border-slate-300 bg-white text-slate-500 hover:border-slate-500"
      }`}
    >
      Não se aplica / Não conheço
    </button>
  );
}

interface Props {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export function QuestionField({ question, value, onChange, error }: Props) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 sm:p-5 transition ${
        error ? "border-red-400 ring-1 ring-red-300" : "border-slate-200"
      }`}
    >
      <label className="block text-sm sm:text-base font-medium text-slate-800">
        {question.label}
        {question.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {question.help && <p className="mt-1 text-xs text-slate-500">{question.help}</p>}

      <div className="mt-3">
        {question.type === "likert" && (
          <LikertScale value={value} onChange={onChange} allowNA={question.allowNA} />
        )}
        {question.type === "nps" && (
          <NpsScale value={value} onChange={onChange} allowNA={question.allowNA} />
        )}
        {question.type === "select" && (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base sm:text-sm focus:border-naval-600 focus:outline-none focus:ring-2 focus:ring-naval-100"
          >
            <option value="">Selecione…</option>
            {question.optionGroups
              ? question.optionGroups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </optgroup>
                ))
              : question.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
          </select>
        )}
        {question.type === "multiselect" && (
          <MultiSelect question={question} value={value} onChange={onChange} />
        )}
        {question.type === "radio" && (
          <div className="flex flex-wrap gap-2">
            {question.options?.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  value === opt
                    ? "border-naval-600 bg-naval-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 active:bg-slate-50 hover:border-naval-600"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
        {question.type === "text" && (
          <input
            type="text"
            value={value}
            placeholder={question.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base sm:text-sm focus:border-naval-600 focus:outline-none focus:ring-2 focus:ring-naval-100"
          />
        )}
        {question.type === "textarea" && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            placeholder="Opcional"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base sm:text-sm focus:border-naval-600 focus:outline-none focus:ring-2 focus:ring-naval-100"
          />
        )}
      </div>
    </div>
  );
}

// Seleção múltipla de disciplinas, agrupadas por optgroup. O valor é guardado
// como uma string com itens separados por " | " (compatível com o restante do app,
// que trabalha com Record<string, string>). O aluno abre um painel e toca para
// marcar/desmarcar uma ou mais disciplinas.
const MULTI_SEP = " | ";

function MultiSelect({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const selected = value ? value.split(MULTI_SEP).filter(Boolean) : [];
  const selectedSet = new Set(selected);

  const groups = question.optionGroups ?? [];
  const q = filter.trim().toLowerCase();

  function toggle(opt: string) {
    const next = new Set(selectedSet);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);
    // Preserva a ordem original das disciplinas (varre os grupos).
    const ordered = groups
      .flatMap((g) => g.options)
      .filter((o) => next.has(o));
    onChange(ordered.join(MULTI_SEP));
  }

  return (
    <div>
      {/* Chips selecionados */}
      {selected.length > 0 ? (
        <ul className="mb-3 flex flex-wrap gap-2">
          {selected.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                onClick={() => toggle(opt)}
                className="inline-flex items-center gap-1.5 rounded-full border border-naval-600 bg-naval-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-naval-700"
                aria-label={`Remover ${opt}`}
              >
                <span>{opt}</span>
                <span aria-hidden className="text-white/80">✕</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-3 text-xs text-slate-400">Nenhuma disciplina selecionada ainda.</p>
      )}

      {/* Botão para abrir/fechar o painel de seleção */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 transition hover:border-naval-600"
      >
        <span>
          {open
            ? "Fechar lista de disciplinas"
            : selected.length > 0
              ? "Adicionar / editar disciplinas"
              : "Selecionar disciplinas"}
        </span>
        <span aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          {/* Campo de busca para filtrar a lista */}
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Buscar disciplina (código ou nome)…"
            className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-naval-600 focus:outline-none focus:ring-2 focus:ring-naval-100"
          />

          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {groups.map((group) => {
              const opts = group.options.filter(
                (o) => !q || o.toLowerCase().includes(q)
              );
              if (opts.length === 0) return null;
              return (
                <div key={group.label}>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {opts.map((opt) => {
                      const active = selectedSet.has(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggle(opt)}
                          className={`rounded-lg border px-2.5 py-1.5 text-left text-xs transition ${
                            active
                              ? "border-naval-600 bg-naval-600 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:border-naval-600"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {groups.every(
              (g) => g.options.filter((o) => !q || o.toLowerCase().includes(q)).length === 0
            ) && (
              <p className="text-sm text-slate-500">Nenhuma disciplina encontrada para “{filter}”.</p>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {selected.length} selecionada{selected.length === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-naval-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-naval-900"
            >
              Concluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LikertScale({
  value,
  onChange,
  allowNA,
}: {
  value: string;
  onChange: (v: string) => void;
  allowNA?: boolean;
}) {
  // Escala compacta: 5 botões numéricos lado a lado (ótimo em mobile) + legenda nas pontas.
  const short = ["Muito ruim", "Ruim", "Regular", "Bom", "Excelente"];
  return (
    <div>
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {LIKERT_LABELS.map((_, i) => {
          const v = String(i + 1);
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              aria-label={`${v} - ${short[i]}`}
              onClick={() => onChange(v)}
              className={`flex min-h-[52px] flex-col items-center justify-center rounded-lg border px-1 py-1.5 transition ${
                active
                  ? "border-naval-600 bg-naval-600 text-white shadow-sm"
                  : "border-slate-300 bg-white text-slate-600 active:bg-slate-50 hover:border-naval-600 hover:text-naval-700"
              }`}
            >
              <span className="text-base font-bold leading-none">{v}</span>
              <span className={`mt-1 text-[10px] leading-tight ${active ? "text-white/90" : "text-slate-400"}`}>
                {short[i]}
              </span>
            </button>
          );
        })}
      </div>
      {allowNA && <NAButton value={value} onChange={onChange} />}
    </div>
  );
}

function NpsScale({
  value,
  onChange,
  allowNA,
}: {
  value: string;
  onChange: (v: string) => void;
  allowNA?: boolean;
}) {
  return (
    <div>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-11">
        {Array.from({ length: 11 }, (_, i) => String(i)).map((v) => {
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={`flex h-11 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                active
                  ? "border-naval-600 bg-naval-600 text-white"
                  : "border-slate-300 bg-white text-slate-600 active:bg-slate-50 hover:border-naval-600"
              }`}
            >
              {v}
            </button>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
        <span>Nada provável</span>
        <span>Muito provável</span>
      </div>
      {allowNA && <NAButton value={value} onChange={onChange} />}
    </div>
  );
}
