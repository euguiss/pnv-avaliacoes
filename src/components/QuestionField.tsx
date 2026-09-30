import type { Question } from "../data/forms";
import { LIKERT_LABELS } from "../data/forms";

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
          <LikertScale value={value} onChange={onChange} />
        )}
        {question.type === "nps" && <NpsScale value={value} onChange={onChange} />}
        {question.type === "select" && (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-naval-600 focus:outline-none focus:ring-2 focus:ring-naval-100"
          >
            <option value="">Selecione…</option>
            {question.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
        {question.type === "radio" && (
          <div className="flex flex-wrap gap-2">
            {question.options?.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  value === opt
                    ? "border-naval-600 bg-naval-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-naval-600"
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
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-naval-600 focus:outline-none focus:ring-2 focus:ring-naval-100"
          />
        )}
        {question.type === "textarea" && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            placeholder="Opcional"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-naval-600 focus:outline-none focus:ring-2 focus:ring-naval-100"
          />
        )}
      </div>
    </div>
  );
}

function LikertScale({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
      {LIKERT_LABELS.map((label, i) => {
        const v = String(i + 1);
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`rounded-lg border px-2 py-2 text-xs sm:text-[13px] font-medium transition ${
              active
                ? "border-naval-600 bg-naval-600 text-white shadow-sm"
                : "border-slate-300 bg-white text-slate-600 hover:border-naval-600 hover:text-naval-700"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function NpsScale({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: 11 }, (_, i) => String(i)).map((v) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`h-9 w-9 rounded-lg border text-sm font-semibold transition ${
              active
                ? "border-naval-600 bg-naval-600 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:border-naval-600"
            }`}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}
