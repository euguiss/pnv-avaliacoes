// Definições dos 4 formulários de avaliação do Departamento PNV (Eng. Naval e Oceânica / Poli-USP)
// As listas de matérias e professores são placeholders editáveis — veja README para como preencher
// com os dados oficiais do JupiterWeb / site do departamento.

export type QuestionType = "likert" | "nps" | "select" | "text" | "textarea" | "radio";

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  required?: boolean;
  options?: string[]; // para select / radio
  help?: string;
}

export interface FormDef {
  slug: string;
  title: string;
  short: string;
  description: string;
  icon: string;
  accent: string; // classe tailwind de cor
  questions: Question[];
}

// Escala Likert padrão usada em todos os formulários
export const LIKERT_LABELS = [
  "1 · Muito ruim",
  "2 · Ruim",
  "3 · Regular",
  "4 · Bom",
  "5 · Excelente",
];

// ⚠️ EDITE ESTAS LISTAS com os dados oficiais (JupiterWeb → sigla "PNV"; site pnv.poli.usp.br → Docentes)
export const MATERIAS: string[] = [
  "PNV3100 – (edite: nome da disciplina)",
  "PNV3200 – (edite: nome da disciplina)",
  "PNV3320 – (edite: nome da disciplina)",
  "Outra (especificar nos comentários)",
];

// Docentes/orientadores do PNV — fonte oficial: https://sites.usp.br/ppgen/orientadores/
// + chefia atual (Gustavo Roque da Silva Assi). Confirme/atualize conforme o site do departamento.
export const PROFESSORES: string[] = [
  "Alexandre Kawano",
  "Alexandre Nicolaos Simos",
  "André Bergsten Mendes",
  "Celso Pupo Pesce",
  "Cheng Liang Yee",
  "Claudio Mueller Prado Sampaio",
  "Claudio Ruggieri",
  "Clóvis de Arruda Martins",
  "Daniel Prata Vieira",
  "Diego Felipe Sarzosa Burgos",
  "Eduardo Aoun Tannuri",
  "Éverton Lins de Oliveira",
  "Gustavo Roque da Silva Assi",
  "Helio Mitio Morishita",
  "Joaquim Rocha dos Santos",
  "Jordi Mas Soler",
  "Julio Romano Meneghini",
  "Lucas Henrique Souza do Carmo",
  "Marcelo Ramos Martins",
  "Paula Birocchi",
  "Pedro Cardozo de Mello",
  "Renato Picelli Sanches",
  "Thiago Lopes",
  "Outro (especificar nos comentários)",
];

export const SEMESTRES: string[] = [
  "2024/1",
  "2024/2",
  "2025/1",
  "2025/2",
  "2026/1",
];

export const ANOS_CURSO = ["1º ano", "2º ano", "3º ano", "4º ano", "5º ano"];

export const FORMS: FormDef[] = [
  {
    slug: "materias",
    title: "Avaliação das Disciplinas do PNV",
    short: "Matérias",
    description: "Seu feedback ajuda a melhorar as disciplinas do curso. É anônimo e leva ~3 min.",
    icon: "📚",
    accent: "bg-blue-600",
    questions: [
      { id: "disciplina", label: "Qual disciplina você está avaliando?", type: "select", required: true, options: MATERIAS },
      { id: "semestre", label: "Em que semestre/ano você cursou?", type: "select", options: SEMESTRES },
      { id: "clareza", label: "Clareza dos objetivos e do conteúdo da disciplina.", type: "likert", required: true },
      { id: "material", label: "Qualidade do material didático (slides, apostilas, bibliografia).", type: "likert", required: true },
      { id: "carga", label: "A carga de trabalho foi compatível com os créditos?", type: "likert", required: true },
      { id: "relevancia", label: "Relevância do conteúdo para a formação em Eng. Naval e Oceânica.", type: "likert", required: true },
      { id: "pratica", label: "Integração entre teoria e prática (laboratórios, projetos).", type: "likert", required: true },
      { id: "avaliacao", label: "Os critérios e prazos de avaliação foram claros e justos?", type: "likert", required: true },
      { id: "infra", label: "Infraestrutura usada na disciplina (laboratórios, softwares, salas).", type: "likert", required: true },
      { id: "geral", label: "Nota geral da disciplina.", type: "likert", required: true },
      { id: "recomenda", label: "De 0 a 10, quanto recomendaria esta disciplina a um colega?", type: "nps" },
      { id: "positivo", label: "O que funcionou bem nesta disciplina?", type: "textarea" },
      { id: "melhorar", label: "O que poderia melhorar?", type: "textarea" },
    ],
  },
  {
    slug: "professores",
    title: "Avaliação dos Docentes do PNV",
    short: "Professores",
    description:
      "Feedback construtivo e anônimo sobre o corpo docente. Sem ataques pessoais, por favor. ~3 min.",
    icon: "👩‍🏫",
    accent: "bg-emerald-600",
    questions: [
      { id: "professor", label: "Qual professor(a) você está avaliando?", type: "select", required: true, options: PROFESSORES },
      { id: "disciplina", label: "Em qual disciplina você teve aula com este(a) docente?", type: "text" },
      { id: "didatica", label: "Clareza e didática nas explicações.", type: "likert", required: true },
      { id: "dominio", label: "Domínio e atualização do conteúdo.", type: "likert", required: true },
      { id: "disponibilidade", label: "Disponibilidade para tirar dúvidas.", type: "likert", required: true },
      { id: "organizacao", label: "Organização das aulas e cumprimento do cronograma.", type: "likert", required: true },
      { id: "coerencia", label: "Coerência entre conteúdo ensinado e cobrado nas avaliações.", type: "likert", required: true },
      { id: "respeito", label: "Postura respeitosa e ambiente de aprendizado.", type: "likert", required: true },
      { id: "engajamento", label: "Capacidade de motivar e engajar a turma.", type: "likert", required: true },
      { id: "geral", label: "Nota geral do(a) docente.", type: "likert", required: true },
      { id: "positivo", label: "Pontos fortes do(a) docente.", type: "textarea" },
      { id: "melhorar", label: "Sugestões de melhoria.", type: "textarea" },
    ],
  },
  {
    slug: "vida-universitaria",
    title: "Vida Universitária no Curso",
    short: "Vida Universitária",
    description: "Como está sua experiência para além da sala de aula? Anônimo, ~4 min.",
    icon: "🎓",
    accent: "bg-violet-600",
    questions: [
      { id: "ano", label: "Ano que você está cursando.", type: "select", required: true, options: ANOS_CURSO },
      { id: "acolhimento", label: "Acolhimento dos calouros (recepção, integração).", type: "likert", required: true },
      { id: "ca", label: "Atuação do Centro Acadêmico / representação estudantil.", type: "likert", required: true },
      {
        id: "entidades",
        label: "Participação em entidades estudantis (equipes, empresa júnior, atlética).",
        type: "radio",
        options: ["Participo atualmente", "Já participei", "Nunca participei"],
      },
      { id: "eventos", label: "Qualidade dos eventos (semanas acadêmicas, palestras, visitas técnicas).", type: "likert", required: true },
      { id: "espacos", label: "Espaços de convivência e infraestrutura do campus.", type: "likert", required: true },
      { id: "bemestar", label: "Equilíbrio entre carga acadêmica e saúde mental / bem-estar.", type: "likert", required: true },
      {
        id: "apoio",
        label: "Você sabe como acessar os serviços de apoio (psicológico, financeiro, tutoria)?",
        type: "radio",
        options: ["Sim", "Mais ou menos", "Não"],
      },
      { id: "pertencimento", label: "Sentimento de pertencimento à turma e ao curso.", type: "likert", required: true },
      { id: "networking", label: "Oportunidades de networking e contato com o mercado/Marinha/empresas.", type: "likert", required: true },
      { id: "quero", label: "Que atividade/evento você gostaria que existisse ou se repetisse?", type: "textarea" },
      { id: "negativo", label: "O que mais impacta negativamente sua experiência hoje?", type: "textarea" },
    ],
  },
  {
    slug: "departamento",
    title: "Avaliação do Departamento PNV",
    short: "Departamento",
    description: "Feedback sobre gestão, estrutura e comunicação do departamento. Anônimo, ~4 min.",
    icon: "🏛️",
    accent: "bg-amber-600",
    questions: [
      { id: "ano", label: "Ano que você está cursando.", type: "select", required: true, options: ANOS_CURSO },
      { id: "comunicacao", label: "Comunicação do departamento com os alunos (avisos, prazos, mudanças).", type: "likert", required: true },
      { id: "secretaria", label: "Facilidade de contato com a secretaria / coordenação.", type: "likert", required: true },
      { id: "grade", label: "Organização da grade e oferta de disciplinas (conflitos, pré-requisitos, vagas).", type: "likert", required: true },
      { id: "infra", label: "Infraestrutura (laboratórios, tanque de provas, softwares, salas).", type: "likert", required: true },
      { id: "ic", label: "Oferta e clareza sobre iniciação científica, estágios e bolsas.", type: "likert", required: true },
      { id: "extensao", label: "Apoio a atividades de extensão e projetos estudantis.", type: "likert", required: true },
      { id: "transparencia", label: "Transparência nas decisões e abertura para ouvir os alunos.", type: "likert", required: true },
      { id: "mercado", label: "Alinhamento do curso com o mercado e tendências (offshore, energias limpas, digitalização).", type: "likert", required: true },
      { id: "geral", label: "Avaliação geral do departamento.", type: "likert", required: true },
      { id: "forte", label: "Qual é o maior ponto forte do PNV hoje?", type: "textarea" },
      { id: "prioridade", label: "Qual é a prioridade nº 1 de melhoria para o departamento?", type: "textarea" },
    ],
  },
];

export function getForm(slug: string): FormDef | undefined {
  return FORMS.find((f) => f.slug === slug);
}
