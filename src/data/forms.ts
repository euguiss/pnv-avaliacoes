// Definições dos 4 formulários de avaliação do Departamento PNV (Eng. Naval e Oceânica / Poli-USP)
// Matérias e professores preenchidos com dados oficiais (relação de disciplinas PNV ativas
// e orientadores do PPGEN). Atualize conforme mudanças de grade / corpo docente.

export type QuestionType = "likert" | "nps" | "select" | "text" | "textarea" | "radio";

// Grupo de opções para <select> (permite <optgroup>).
export interface OptionGroup {
  label: string;
  options: string[];
}

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  required?: boolean;
  options?: string[]; // para select / radio (lista simples)
  optionGroups?: OptionGroup[]; // para select agrupado (<optgroup>)
  help?: string;
  placeholder?: string;
  // Renderiza esta pergunta só quando outra pergunta tiver um dos valores listados.
  // Ex.: campo "outra disciplina" aparece só quando disciplina === "Outra (...)".
  showIf?: { questionId: string; equals: string[] };
}

export interface FormDef {
  slug: string;
  title: string;
  short: string;
  description: string;
  icon: string;
  accent: string; // classe tailwind de cor
  questions: Question[];
  // repeatable = o aluno pode avaliar vários itens (várias matérias / professores) numa sessão.
  repeatable?: boolean;
  // groupBy = id da pergunta usada para segmentar as métricas no admin
  // (ex.: "disciplina" agrupa por matéria; "professor" agrupa por docente).
  groupBy?: string;
  // texto do botão para adicionar mais uma avaliação (quando repeatable).
  addMoreLabel?: string;
}

// Escala Likert padrão usada em todos os formulários
export const LIKERT_LABELS = [
  "1 · Muito ruim",
  "2 · Ruim",
  "3 · Regular",
  "4 · Bom",
  "5 · Excelente",
];

// Disciplinas PNV ativas (fonte: relação oficial de disciplinas do departamento).
// Filtramos as versões substituídas por mudança de grade, mantendo as vigentes.
// A grade nova usa prefixo PNV1xxx; as PNV3xxx são as demais disciplinas ainda ofertadas.
// Ex.: Introdução à Eng. Naval agora é PNV1120; Hidrostática e Estabilidade agora é PNV1222.
export const MATERIAS_GRUPOS: OptionGroup[] = [
  {
    label: "Grade nova (ciclo básico – PNV1xxx)",
    options: [
      "PNV1100 – Introdução ao Projeto de Engenharia",
      "PNV1120 – Introdução à Engenharia Naval e Oceânica",
      "PNV1211 – Desafios Atuais na Engenharia Naval e Oceânica",
      "PNV1221 – Fundamentos de Mecânica dos Sólidos e Resistência dos Materiais",
      "PNV1222 – Hidrostática e Estabilidade",
      "PNV1560 – Princípios de Células a Combustível",
    ],
  },
  {
    label: "Disciplinas do curso (PNV3xxx)",
    options: [
      "PNV3210 – Introdução à Engenharia Naval e Oceânica (grade anterior)",
      "PNV3212 – Mecânica dos Sólidos I",
      "PNV3222 – Mecânica dos Sólidos II",
      "PNV3314 – Dinâmica de Sistemas I",
      "PNV3315 – Hidrostática e Estabilidade (grade anterior)",
      "PNV3321 – Métodos de Otimização Aplicados a Sistemas de Engenharia",
      "PNV3322 – Mecânica de Estruturas Navais e Oceânicas I",
      "PNV3323 – Hidrodinâmica I",
      "PNV3324 – Fundamentos de Controle em Engenharia",
      "PNV3391 – Laboratório de Engenharia Naval I",
      "PNV3392 – Laboratório de Engenharia Naval II",
      "PNV3395 – Projeto de Extensão I",
      "PNV3396 – Projeto de Extensão II",
      "PNV3411 – Transportes Marítimo e Fluvial",
      "PNV3412 – Mecânica de Estruturas Navais e Oceânicas II",
      "PNV3413 – Hidrodinâmica II",
      "PNV3414 – Dinâmica de Sistemas II",
      "PNV3415 – Projeto de Navios",
      "PNV3416 – Instalações Propulsoras",
      "PNV3421 – Processos Estocásticos",
      "PNV3425 – Projeto de Sistemas Oceânicos",
      "PNV3426 – Introdução a Projetos de Sistemas Oceânicos para Extração de Petróleo",
      "PNV3510 – Trabalho de Formatura I",
      "PNV3511 – Operações de Apoio à Exploração e Produção de Petróleo",
      "PNV3512 – Planejamento e Operações de Sistemas Logísticos",
      "PNV3513 – Planejamento e Operações de Sistemas Portuários",
      "PNV3514 – Estágio Supervisionado",
      "PNV3516 – Projeto de Pesquisa em Engenharia Naval e Oceânica I",
      "PNV3517 – Sistemas de Apoio à Exploração e Produção do Petróleo no Mar",
      "PNV3520 – Trabalho de Formatura II",
      "PNV3521 – Tecnologia de Veículos Marítimos",
      "PNV3522 – Exploração de Óleo e Gás",
      "PNV3523 – Energia Renovável do Oceano",
      "PNV3526 – Projeto de Pesquisa em Engenharia Naval e Oceânica II",
    ],
  },
  {
    label: "Optativas / tópicos (PNV36xx)",
    options: [
      "PNV3621 – Engenharia além da Técnica",
      "PNV3631 – Princípios de Fadiga e Fratura de Estruturas Navais e Oceânicas",
      "PNV3641 – Métodos Experimentais para Validação de Sistemas Oceânicos",
      "PNV3642 – Introdução ao Projeto de Veleiros",
      "PNV3643 – Materiais e Processos de Fabricação em Construção Naval",
      "PNV3644 – Seminários sobre Tópicos da Indústria de Petróleo, Gás Natural e Biocombustíveis",
      "PNV3645 – Aspectos Políticos, Ambientais, Legais e Práticos do Uso do Mar",
      "PNV3646 – Introdução à Confiabilidade de Sistemas e Análise de Risco",
      "PNV3647 – Hidrodinâmica em águas confinadas de portos e hidrovias",
    ],
  },
  {
    label: "Outra",
    options: ["Outra disciplina (não listada)"],
  },
];

// Valor da opção "Outra" da disciplina (usado para mostrar o campo condicional).
export const MATERIA_OUTRA = "Outra disciplina (não listada)";

// Lista achatada (compat. para exportação/validação e outros usos).
export const MATERIAS: string[] = MATERIAS_GRUPOS.flatMap((g) => g.options);

// Docentes/orientadores do PNV — fonte oficial: https://sites.usp.br/ppgen/orientadores/
// + chefia atual (Gustavo Roque da Silva Assi). Confirme/atualize conforme o site do departamento.
export const PROFESSORES: string[] = [
  "Alexandre Kawano",
  "Alexandre Nicolaos Simos",
  "André Bergsten Mendes",
  "Bernardo Luis Rodrigues de Andrade",
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
  "Kazuo Nishimoto",
  "Lucas Henrique Souza do Carmo",
  "Marcelo Ramos Martins",
  "Marcos Mendes de Oliveira Pinto",
  "Paula Birocchi",
  "Pedro Cardozo de Mello",
  "Renato Picelli Sanches",
  "Thiago Lopes",
  "Outro(a) docente (não listado)",
];

// Valor da opção "Outro" do docente (usado para mostrar o campo condicional).
export const PROFESSOR_OUTRO = "Outro(a) docente (não listado)";

// Semestres do mais recente ao mais antigo (até 2018/1 — ainda há veteranos dessa época).
export const SEMESTRES: string[] = [
  "2026/2",
  "2026/1",
  "2025/2",
  "2025/1",
  "2024/2",
  "2024/1",
  "2023/2",
  "2023/1",
  "2022/2",
  "2022/1",
  "2021/2",
  "2021/1",
  "2020/2",
  "2020/1",
  "2019/2",
  "2019/1",
  "2018/2",
  "2018/1",
  "Antes de 2018/1",
];

export const ANOS_CURSO = ["1º ano", "2º ano", "3º ano", "4º ano", "5º ano"];

export const FORMS: FormDef[] = [
  {
    slug: "materias",
    title: "Avaliação das Disciplinas do PNV",
    short: "Matérias",
    description: "Avalie as disciplinas que você cursou. É anônimo. Você pode avaliar quantas quiser.",
    icon: "📚",
    accent: "bg-blue-600",
    repeatable: true,
    groupBy: "disciplina",
    addMoreLabel: "+ Avaliar outra disciplina",
    questions: [
      { id: "disciplina", label: "Qual disciplina você está avaliando?", type: "select", required: true, optionGroups: MATERIAS_GRUPOS },
      {
        id: "disciplina_outra",
        label: "Digite o código e o nome da disciplina",
        type: "text",
        required: true,
        placeholder: "Ex.: PNV3417 – Nome da disciplina",
        showIf: { questionId: "disciplina", equals: [MATERIA_OUTRA] },
      },
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
      "Feedback construtivo e anônimo sobre o corpo docente. Sem ataques pessoais, por favor. Avalie quantos quiser.",
    icon: "👩‍🏫",
    accent: "bg-emerald-600",
    repeatable: true,
    groupBy: "professor",
    addMoreLabel: "+ Avaliar outro(a) docente",
    questions: [
      { id: "professor", label: "Qual professor(a) você está avaliando?", type: "select", required: true, options: PROFESSORES },
      {
        id: "professor_outro",
        label: "Digite o nome do(a) docente",
        type: "text",
        required: true,
        placeholder: "Nome completo do(a) professor(a)",
        showIf: { questionId: "professor", equals: [PROFESSOR_OUTRO] },
      },
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
