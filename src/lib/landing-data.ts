import { MessageCircle, CheckSquare, Building2, Bell, User, BarChart } from "lucide-react"

export const STATS = {
  companies: "2.500+",
  simulations: "15.000+",
  satisfaction: "98%",
  articles: "50+",
}

export const FEATURES = [
  {
    icon: MessageCircle,
    title: "Assistente IA Especializado",
    description: "Tire duvidas complexas sobre a reforma em segundos, com respostas baseadas na legislacao oficial.",
    benefits: [
      "Respostas em tempo real 24/7",
      "Citacoes da EC 132/2023",
      "Linguagem simples e direta",
    ],
  },
  {
    icon: CheckSquare,
    title: "Checklists de Conformidade",
    description: "Saiba exatamente o que sua empresa precisa fazer para se adequar aos novos tributos.",
    benefits: [
      "Tarefas organizadas por prazo",
      "Adaptado ao seu regime tributario",
      "Atualizacoes automaticas",
    ],
  },
  {
    icon: Building2,
    title: "Orientacao por Setor",
    description: "Cada setor tem regras especificas. Receba orientacao personalizada para sua area de atuacao.",
    benefits: [
      "Aliquotas especificas por setor",
      "Regimes diferenciados",
      "Casos praticos do seu mercado",
    ],
  },
  {
    icon: Bell,
    title: "Alertas de Regulamentacao",
    description: "Seja notificado sobre novas leis complementares e regulamentacoes que afetam sua empresa.",
    benefits: [
      "Atualizacoes em tempo real",
      "Filtro por relevancia",
      "Resumo executivo das mudancas",
    ],
  },
]

export const TESTIMONIALS = [
  {
    name: "Ricardo Mendes",
    role: "CEO, TechSolutions Ltda",
    quote: "O ImpostoFacil me economizou horas de pesquisa. Em 10 minutos entendi como a reforma vai impactar minha empresa de software.",
    avatar: "RM",
  },
  {
    name: "Ana Paula Costa",
    role: "Contadora, Escritorio Costa & Associados",
    quote: "Uso a plataforma para me manter atualizada e tirar duvidas rapidas dos meus clientes. A base de conhecimento e muito completa.",
    avatar: "AC",
  },
  {
    name: "Fernando Silva",
    role: "Diretor Financeiro, Distribuidora ABC",
    quote: "A simulacao de impacto nos ajudou a planejar o fluxo de caixa para o periodo de transicao. Ferramenta essencial.",
    avatar: "FS",
  },
]

export const PRICING_TIERS = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "/mes",
    description: "Para quem quer comecar a entender a reforma",
    features: [
      "5 perguntas ao assistente/mes",
      "Artigos basicos da base de conhecimento",
      "Glossario completo",
      "Cronograma de transicao",
    ],
    limitations: [
      "Sem checklists personalizados",
      "Sem alertas de regulamentacao",
    ],
    cta: "Comecar gratis",
    highlighted: false,
  },
  {
    name: "Profissional",
    price: "R$ 49",
    period: "/mes",
    description: "Para empresarios que precisam se preparar",
    features: [
      "Perguntas ilimitadas ao assistente",
      "Base de conhecimento completa",
      "Checklists de conformidade",
      "Alertas de regulamentacao",
      "Suporte prioritario",
    ],
    limitations: [],
    cta: "Assinar agora",
    highlighted: true,
  },
  {
    name: "Empresarial",
    price: "R$ 199",
    period: "/mes",
    description: "Para empresas com equipes fiscais",
    features: [
      "Tudo do plano Profissional",
      "Ate 5 usuarios",
      "Relatorios de impacto",
      "1 hora de consultoria/mes",
      "API de integracao",
    ],
    limitations: [],
    cta: "Falar com vendas",
    highlighted: false,
  },
  {
    name: "Contador",
    price: "R$ 399",
    period: "/mes",
    description: "Para escritorios de contabilidade",
    features: [
      "Tudo do plano Empresarial",
      "Gestao multi-cliente",
      "White-label (sua marca)",
      "API completa",
      "Suporte dedicado",
    ],
    limitations: [],
    cta: "Falar com vendas",
    highlighted: false,
  },
]

export const FAQ_ITEMS = [
  {
    question: "O que e a reforma tributaria EC 132/2023?",
    answer: "A Emenda Constitucional 132/2023 e a maior reforma do sistema tributario brasileiro em decadas. Ela substitui 5 tributos (ICMS, ISS, PIS, Cofins e IPI) por 3 novos: IBS (estadual/municipal), CBS (federal) e Imposto Seletivo. O objetivo e simplificar o sistema, acabar com a cumulatividade e unificar a legislacao nacional.",
  },
  {
    question: "Como a reforma afeta minha empresa?",
    answer: "O impacto varia conforme seu setor, estado e regime tributario. Empresas que hoje tem muitos creditos acumulados (como exportadores) tendem a se beneficiar. Ja empresas do setor de servicos podem ter aumento de carga. O ImpostoFacil analisa seu perfil e mostra especificamente como voce sera afetado.",
  },
  {
    question: "Preciso me preparar agora? A reforma so comeca em 2026.",
    answer: "Sim, e urgente comecar agora. Em 2026 ja comeca a cobranca (com aliquotas reduzidas) e sua empresa precisa estar com sistemas, processos e contratos adaptados. Empresas que deixarem para ultima hora vao enfrentar custos muito maiores de adequacao e podem perder creditos tributarios.",
  },
  {
    question: "O plano gratuito tem limitacoes?",
    answer: "O plano gratuito permite 5 perguntas ao assistente por mes e acesso aos artigos basicos. E ideal para quem quer conhecer a plataforma. Para uso profissional, recomendamos o plano Profissional que oferece perguntas ilimitadas, checklists personalizados e alertas de regulamentacao.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim, todos os planos pagos podem ser cancelados a qualquer momento, sem multa ou fidelidade. Alem disso, oferecemos garantia de 7 dias - se voce nao ficar satisfeito, devolvemos seu dinheiro integralmente.",
  },
  {
    question: "As informacoes sao confiaveis?",
    answer: "Sim. Todo nosso conteudo e baseado na legislacao oficial: Emenda Constitucional 132/2023, leis complementares e regulamentacoes da Receita Federal. Nosso time juridico revisa o conteudo regularmente. Importante: somos uma ferramenta educacional e nao substituimos a consultoria de um contador ou advogado tributarista.",
  },
]

export const HOW_IT_WORKS_STEPS = [
  {
    icon: User,
    number: 1,
    title: "Crie seu perfil",
    description: "Informe seu estado, setor e regime tributario em menos de 2 minutos.",
  },
  {
    icon: BarChart,
    number: 2,
    title: "Receba analise personalizada",
    description: "Nosso sistema analisa como a reforma impacta especificamente sua empresa.",
  },
  {
    icon: Bell,
    number: 3,
    title: "Mantenha-se atualizado",
    description: "Receba alertas sobre novas regulamentacoes e prazos importantes.",
  },
]

export const PROBLEM_STATS = [
  {
    value: "5",
    label: "tributos diferentes",
    description: "ICMS, ISS, PIS, Cofins, IPI - cada um com suas proprias regras",
  },
  {
    value: "27",
    label: "legislacoes estaduais",
    description: "Cada estado com aliquotas e beneficios diferentes",
  },
  {
    value: "1.500+",
    label: "horas/ano",
    description: "Tempo medio gasto por empresas em compliance tributario",
  },
]

export const BEFORE_AFTER = {
  before: {
    title: "Sistema Atual",
    items: [
      "5 tributos sobre consumo",
      "27 legislacoes estaduais diferentes",
      "Cumulatividade e creditos perdidos",
      "Guerra fiscal entre estados",
      "Complexidade extrema",
    ],
  },
  after: {
    title: "Novo Sistema (2033)",
    items: [
      "3 tributos simplificados (IBS, CBS, IS)",
      "Legislacao nacional unificada",
      "Nao-cumulatividade plena",
      "Cobranca no destino",
      "Regras claras e transparentes",
    ],
  },
}

export const TRUST_BADGES = [
  {
    title: "Baseado na EC 132/2023",
    description: "Legislacao oficial",
  },
  {
    title: "Fontes: Receita Federal",
    description: "Dados verificados",
  },
  {
    title: "Dados protegidos",
    description: "Criptografia SSL",
  },
]

// Deadline: End of penalty-free adaptation period (approximately April 2026)
// Source: TOTVS / Receita Federal - "período de adaptação se estende até abril de 2026"
export const TARGET_DATE = new Date("2026-04-30T23:59:59")

export const PENALTY_DEADLINE_INFO = {
  date: "Abril de 2026",
  title: "Fim do período sem multas",
  description: "A Receita Federal e o Comitê Gestor do IBS estabeleceram um período de adaptação de até 4 meses após a publicação dos regulamentos (janeiro de 2026). Durante esse período, não há aplicação automática de multas por falhas no preenchimento do IBS e CBS nos documentos fiscais. Após esse prazo, as regras passam a ser exigidas com possibilidade de penalidades.",
  source: "TOTVS / Receita Federal",
  sourceUrl: "https://www.totvs.com/blog/adequacao-a-legislacao/reforma-tributaria/"
}
