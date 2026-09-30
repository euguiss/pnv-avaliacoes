import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getForm } from "../data/forms";
import { QuestionField } from "../components/QuestionField";
import { newId, saveSubmission, syncSubmission } from "../lib/storage";

export function FormPage() {
  const { slug = "" } = useParams();
  const form = getForm(slug);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

  if (!form) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-slate-600">Formulário não encontrado.</p>
        <Link to="/" className="mt-4 inline-block text-naval-600 underline">
          Voltar ao início
        </Link>
      </div>
    );
  }

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    const missing = new Set<string>();
    for (const q of form.questions) {
      if (q.required && !answers[q.id]?.trim()) missing.add(q.id);
    }
    if (missing.size > 0) {
      setErrors(missing);
      const firstId = form.questions.find((q) => missing.has(q.id))?.id;
      document.getElementById(`q-${firstId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const submission = {
      id: newId(),
      formSlug: form.slug,
      createdAt: new Date().toISOString(),
      answers,
    };
    saveSubmission(submission);
    // Envia ao backend remoto se configurado (não bloqueia a UI).
    void syncSubmission(submission);
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
          ✅
        </div>
        <h1 className="text-2xl font-bold text-naval-900">Obrigado pela sua resposta!</h1>
        <p className="mt-2 text-slate-600">Sua avaliação foi registrada de forma anônima.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-lg bg-naval-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-naval-700"
          >
            Voltar ao início
          </Link>
          <button
            onClick={() => {
              setAnswers({});
              setDone(false);
            }}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Responder novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/" className="text-sm text-naval-600 hover:underline">
        ← Todos os formulários
      </Link>

      <div className={`mt-4 rounded-2xl ${form.accent} p-6 text-white`}>
        <div className="text-3xl">{form.icon}</div>
        <h1 className="mt-2 text-xl font-bold sm:text-2xl">{form.title}</h1>
        <p className="mt-1 text-sm text-white/90">{form.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {form.questions.map((q) => (
          <div key={q.id} id={`q-${q.id}`}>
            <QuestionField
              question={q}
              value={answers[q.id] ?? ""}
              onChange={(v) => setAnswer(q.id, v)}
              error={errors.has(q.id)}
            />
          </div>
        ))}

        {errors.size > 0 && (
          <p className="text-sm text-red-600">
            Por favor, responda as perguntas obrigatórias destacadas.
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-naval-800 py-3 text-base font-semibold text-white transition hover:bg-naval-900"
        >
          Enviar avaliação
        </button>
      </form>
    </div>
  );
}
