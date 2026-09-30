import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FORMS, MATERIA_OUTRA, PROFESSOR_OUTRO } from "../data/forms";
import type { FormDef } from "../data/forms";
import { QuestionField } from "../components/QuestionField";
import { useSession } from "../lib/session";
import { markResponded, newId, submit } from "../lib/storage";

// Ordem do fluxo guiado
const STEPS = FORMS;

// Se o usuário escolheu "Outra/Outro" e digitou um valor, usa o valor digitado
// como identificador (para o admin agrupar corretamente por matéria/professor).
function normalizeAnswers(answers: Record<string, string>): Record<string, string> {
  const a = { ...answers };
  if (a.disciplina === MATERIA_OUTRA && a.disciplina_outra?.trim()) {
    a.disciplina = a.disciplina_outra.trim();
  }
  if (a.professor === PROFESSOR_OUTRO && a.professor_outro?.trim()) {
    a.professor = a.professor_outro.trim();
  }
  return a;
}

export function Flow() {
  const navigate = useNavigate();
  const session = useSession();
  const [step, setStep] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const isReview = step >= STEPS.length;
  const form = STEPS[step];

  // Ao mudar de etapa, rola a página para o topo (importante no mobile).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  async function finish() {
    setSending(true);
    setError("");
    const ok = await submit({
      submissionId: newId(),
      createdAt: new Date().toISOString(),
      items: session.items,
    });
    setSending(false);
    if (ok) {
      markResponded(STEPS.map((s) => s.slug));
      navigate("/obrigado");
    } else {
      setError(
        "Não foi possível enviar suas respostas. Isso pode ser uma instabilidade momentânea — tente novamente em alguns instantes. Se persistir, avise a organização."
      );
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <ProgressBar current={step} total={STEPS.length} />

      {!isReview && (
        <StepSection
          key={form.slug}
          form={form}
          onNext={() => setStep((s) => s + 1)}
          onBack={step > 0 ? () => setStep((s) => s - 1) : undefined}
        />
      )}

      {isReview && (
        <ReviewStep
          onBack={() => setStep(STEPS.length - 1)}
          onFinish={finish}
          sending={sending}
          error={error}
        />
      )}
    </div>
  );
}

// Legenda explicando a escala de notas de 1 a 5, exibida uma vez por seção.
function ScaleLegend() {
  const items = [
    { n: 1, label: "Muito ruim", desc: "muito abaixo do esperado" },
    { n: 2, label: "Ruim", desc: "abaixo do esperado" },
    { n: 3, label: "Regular", desc: "atende ao mínimo" },
    { n: 4, label: "Bom", desc: "acima do esperado" },
    { n: 5, label: "Excelente", desc: "muito acima do esperado" },
  ];
  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-700">Como avaliar (escala de 1 a 5)</p>
      <p className="mt-0.5 text-xs text-slate-500">
        Em cada pergunta, escolha a nota que melhor representa sua experiência:
      </p>
      <ul className="mt-3 space-y-1.5">
        {items.map((it) => (
          <li key={it.n} className="flex items-center gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-naval-600 text-xs font-bold text-white">
              {it.n}
            </span>
            <span className="text-slate-700">
              <strong>{it.label}</strong>
              <span className="text-slate-400"> — {it.desc}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const steps = [...STEPS.map((s) => s.short), "Revisão"];
  const pct = ((Math.min(current, total) + 1) / (total + 1)) * 100;
  const currentLabel = steps[Math.min(current, total)];
  return (
    <div className="mb-6">
      {/* Mobile: etapa atual em texto. Desktop: todos os rótulos. */}
      <div className="mb-2 flex items-center justify-between text-xs font-medium sm:hidden">
        <span className="text-naval-700">{currentLabel}</span>
        <span className="text-slate-400">
          Etapa {Math.min(current, total) + 1} de {total + 1}
        </span>
      </div>
      <div className="mb-2 hidden justify-between text-xs font-medium sm:flex">
        {steps.map((label, i) => (
          <span key={label} className={i <= current ? "text-naval-700" : "text-slate-400"}>
            {label}
          </span>
        ))}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-naval-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Uma seção do fluxo (um formulário). Se repeatable, acumula várias avaliações.
function StepSection({
  form,
  onNext,
  onBack,
}: {
  form: FormDef;
  onNext: () => void;
  onBack?: () => void;
}) {
  const session = useSession();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const added = session.itemsForForm(form.slug);

  // Uma pergunta condicional só é visível quando a pergunta-gatilho tem o valor esperado.
  function isVisible(q: (typeof form.questions)[number]): boolean {
    if (!q.showIf) return true;
    return q.showIf.equals.includes(answers[q.showIf.questionId] ?? "");
  }

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => {
      const next = { ...prev, [id]: value };
      // Se o gatilho mudou, limpa campos condicionais que deixaram de ser visíveis.
      for (const q of form.questions) {
        if (q.showIf && q.showIf.questionId === id && !q.showIf.equals.includes(value)) {
          delete next[q.id];
        }
      }
      return next;
    });
    setErrors((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  }

  function validate(): boolean {
    const missing = new Set<string>();
    for (const q of form.questions) {
      if (q.required && isVisible(q) && !answers[q.id]?.trim()) missing.add(q.id);
    }
    setErrors(missing);
    if (missing.size > 0) {
      const first = form.questions.find((q) => missing.has(q.id))?.id;
      document.getElementById(`q-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  // Verifica se o usuário preencheu ALGO (para não exigir preencher tudo em forms opcionais).
  function hasAnyAnswer(): boolean {
    return Object.values(answers).some((v) => v && v.trim().length > 0);
  }

  function addCurrent(): boolean {
    if (!validate()) return false;
    session.addItem({ formSlug: form.slug, answers: normalizeAnswers(answers) });
    setAnswers({});
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }

  function handleAddMore() {
    addCurrent();
  }

  function handleNext() {
    if (form.repeatable) {
      // Se há algo preenchido, salva antes de avançar; senão, só avança (já pode ter adicionado antes).
      if (hasAnyAnswer()) {
        if (!addCurrent()) return;
      }
      onNext();
    } else {
      // Forms não-repetíveis: se preencheu algo, valida e salva; se pulou, segue sem salvar.
      if (hasAnyAnswer()) {
        if (!validate()) return;
        session.addItem({ formSlug: form.slug, answers: normalizeAnswers(answers) });
      }
      onNext();
    }
  }

  return (
    <div>
      <div className={`rounded-2xl ${form.accent} p-6 text-white`}>
        <div className="text-3xl">{form.icon}</div>
        <h1 className="mt-2 text-xl font-bold sm:text-2xl">{form.title}</h1>
        <p className="mt-1 text-sm text-white/90">{form.description}</p>
      </div>

      {form.questions.some((q) => q.type === "likert") && <ScaleLegend />}

      {form.repeatable && added.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-700">
            {added.length} {added.length === 1 ? "avaliação adicionada" : "avaliações adicionadas"} nesta sessão:
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {added.map((it, i) => (
              <li key={i} className="rounded-full bg-naval-50 px-3 py-1 text-xs text-naval-700">
                {it.answers[form.groupBy || ""] || `Item ${i + 1}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 space-y-4">
        {form.questions.filter(isVisible).map((q) => (
          <div key={q.id} id={`q-${q.id}`}>
            <QuestionField
              question={q}
              value={answers[q.id] ?? ""}
              onChange={(v) => setAnswer(q.id, v)}
              error={errors.has(q.id)}
            />
          </div>
        ))}
      </div>

      {errors.size > 0 && (
        <p className="mt-3 text-sm text-red-600">Responda as perguntas obrigatórias destacadas.</p>
      )}

      <div className="mt-6 space-y-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3 sm:space-y-0">
        <button
          onClick={handleNext}
          className="w-full rounded-lg bg-naval-800 px-6 py-3 text-sm font-semibold text-white hover:bg-naval-900 sm:order-last sm:ml-auto sm:w-auto sm:py-2.5"
        >
          {form.repeatable && hasAnyAnswer() ? "Salvar e continuar →" : "Continuar →"}
        </button>
        {form.repeatable && (
          <button
            onClick={handleAddMore}
            className="w-full rounded-lg border border-naval-600 px-4 py-3 text-sm font-medium text-naval-700 hover:bg-naval-50 sm:w-auto sm:py-2.5"
          >
            {form.addMoreLabel || "+ Adicionar outra"}
          </button>
        )}
        {onBack && (
          <button
            onClick={onBack}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:w-auto sm:py-2.5"
          >
            ← Voltar
          </button>
        )}
      </div>

      {(form.repeatable || !form.questions.some((q) => q.required)) && (
        <p className="mt-3 text-center text-xs text-slate-400">
          Pode pular esta seção se não quiser avaliar agora.
        </p>
      )}
    </div>
  );
}

function ReviewStep({
  onBack,
  onFinish,
  sending,
  error,
}: {
  onBack: () => void;
  onFinish: () => void;
  sending: boolean;
  error: string;
}) {
  const session = useSession();
  const byForm = STEPS.map((f) => ({
    form: f,
    items: session.itemsForForm(f.slug),
  }));
  const total = session.items.length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-naval-900">Revisão</h1>
      <p className="mt-1 text-sm text-slate-500">
        Confira o que você vai enviar. Tudo é anônimo.
      </p>

      <div className="mt-6 space-y-3">
        {byForm.map(({ form, items }) => (
          <div key={form.slug} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-800">
                {form.icon} {form.short}
              </span>
              <span className="text-sm text-slate-500">
                {items.length} {items.length === 1 ? "avaliação" : "avaliações"}
              </span>
            </div>
            {items.length > 0 && form.groupBy && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {items.map((it, i) => (
                  <li key={i} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {it.answers[form.groupBy!] || `Item ${i + 1}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {total === 0 && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Você ainda não preencheu nenhuma avaliação. Volte e responda ao menos uma seção.
        </p>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          ← Voltar
        </button>
        <button
          onClick={onFinish}
          disabled={sending || total === 0}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {sending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {sending ? "Enviando…" : "Enviar avaliações"}
        </button>
      </div>
      {sending && (
        <p className="mt-2 text-center text-xs text-slate-400">
          Enviando com segurança… isso pode levar alguns segundos.
        </p>
      )}
    </div>
  );
}
