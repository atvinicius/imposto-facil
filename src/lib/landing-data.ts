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
    description: "Tire dúvidas complexas sobre a reforma em segundos, com respostas baseadas na legislação oficial.",
    benefits: [
      "Respostas em tempo real 24/7",
      "Citações da EC 132/2023",
      "Linguagem simples e direta",
    ],
  },
  {
    icon: CheckSquare,
    title: "Checklists de Conformidade",
    description: "Saiba exatamente o que sua empresa precisa fazer para se adequar aos novos tributos.",
    benefits: [
      "Tarefas organizadas por prazo",
      "Adaptado ao seu regime tributário",
      "Atualizações automáticas",
    ],
  },
  {
    icon: Building2,
    title: "Orientação por Setor",
    description: "Cada setor tem regras específicas. Receba orientação personalizada para sua área de atuação.",
    benefits: [
      "Alíquotas específicas por setor",
      "Regimes diferenciados",
      "Casos práticos do seu mercado",
    ],
  },
  {
    icon: Bell,
    title: "Alertas de Regulamentação",
    description: "Seja notificado sobre novas leis complementares e regulamentações que afetam sua empresa.",
    benefits: [
      "Atualizações em tempo real",
      "Filtro por relevância",
      "Resumo executivo das mudanças",
    ],
  },
]

export const TESTIMONIALS = [
  {
    name: "Ricardo Mendes",
    role: "CEO, TechSolutions Ltda",
    quote: "O ImpostoFácil me economizou horas de pesquisa. Em 10 minutos entendi como a reforma vai impactar minha empresa de software.",
    avatar: "RM",
  },
  {
    name: "Ana Paula Costa",
    role: "Contadora, Escritório Costa & Associados",
    quote: "Uso a plataforma para me manter atualizada e tirar dúvidas rápidas dos meus clientes. A base de conhecimento é muito completa.",
    avatar: "AC",
  },
  {
    name: "Fernando Silva",
    role: "Diretor Financeiro, Distribuidora ABC",
    quote: "A simulação de impacto nos ajudou a planejar o fluxo de caixa para o período de transição. Ferramenta essencial.",
    avatar: "FS",
  },
]

export const PRICING_TIERS = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    description: "Para quem quer começar a entender a reforma",
    features: [
      "5 perguntas ao assistente/mês",
      "Artigos básicos da base de conhecimento",
      "Glossário completo",
      "Cronograma de transição",
    ],
    limitations: [
      "Sem checklists personalizados",
      "Sem alertas de regulamentação",
    ],
    cta: "Começar grátis",
    highlighted: false,
  },
  {
    name: "Profissional",
    price: "R$ 49",
    period: "/mês",
    description: "Para empresários que precisam se preparar",
    features: [
      "Perguntas ilimitadas ao assistente",
      "Base de conhecimento completa",
      "Checklists de conformidade",
      "Alertas de regulamentação",
      "Suporte prioritário",
    ],
    limitations: [],
    cta: "Assinar agora",
    highlighted: true,
  },
  {
    name: "Empresarial",
    price: "R$ 199",
    period: "/mês",
    description: "Para empresas com equipes fiscais",
    features: [
      "Tudo do plano Profissional",
      "Até 5 usuários",
      "Relatórios de impacto",
      "1 hora de consultoria/mês",
      "API de integração",
    ],
    limitations: [],
    cta: "Falar com vendas",
    highlighted: false,
  },
  {
    name: "Contador",
    price: "R$ 399",
    period: "/mês",
    description: "Para escritórios de contabilidade",
    features: [
      "Tudo do plano Empresarial",
      "Gestão multi-cliente",
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
    question: "O que é a reforma tributária EC 132/2023?",
    answer: "A Emenda Constitucional 132/2023 é a maior reforma do sistema tributário brasileiro em décadas. Ela substitui 5 tributos (ICMS, ISS, PIS, Cofins e IPI) por 3 novos: IBS (estadual/municipal), CBS (federal) e Imposto Seletivo. O objetivo é simplificar o sistema, acabar com a cumulatividade e unificar a legislação nacional.",
  },
  {
    question: "Como a reforma afeta minha empresa?",
    answer: "O impacto varia conforme seu setor, estado e regime tributário. Empresas que hoje têm muitos créditos acumulados (como exportadores) tendem a se beneficiar. Já empresas do setor de serviços podem ter aumento de carga. O ImpostoFácil analisa seu perfil e mostra especificamente como você será afetado.",
  },
  {
    question: "Preciso me preparar agora? A reforma só começa em 2026.",
    answer: "Sim, é urgente começar agora. Em 2026 já começa a cobrança (com alíquotas reduzidas) e sua empresa precisa estar com sistemas, processos e contratos adaptados. Empresas que deixarem para última hora vão enfrentar custos muito maiores de adequação e podem perder créditos tributários.",
  },
  {
    question: "O plano gratuito tem limitações?",
    answer: "O plano gratuito permite 5 perguntas ao assistente por mês e acesso aos artigos básicos. É ideal para quem quer conhecer a plataforma. Para uso profissional, recomendamos o plano Profissional que oferece perguntas ilimitadas, checklists personalizados e alertas de regulamentação.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim, todos os planos pagos podem ser cancelados a qualquer momento, sem multa ou fidelidade. Além disso, oferecemos garantia de 7 dias - se você não ficar satisfeito, devolvemos seu dinheiro integralmente.",
  },
  {
    question: "As informações são confiáveis?",
    answer: "Sim. Todo nosso conteúdo é baseado na legislação oficial: Emenda Constitucional 132/2023, leis complementares e regulamentações da Receita Federal. Nosso time jurídico revisa o conteúdo regularmente. Importante: somos uma ferramenta educacional e não substituímos a consultoria de um contador ou advogado tributarista.",
  },
]

export const HOW_IT_WORKS_STEPS = [
  {
    icon: User,
    number: 1,
    title: "Crie seu perfil",
    description: "Informe seu estado, setor e regime tributário em menos de 2 minutos.",
  },
  {
    icon: BarChart,
    number: 2,
    title: "Receba análise personalizada",
    description: "Nosso sistema analisa como a reforma impacta especificamente sua empresa.",
  },
  {
    icon: Bell,
    number: 3,
    title: "Mantenha-se atualizado",
    description: "Receba alertas sobre novas regulamentações e prazos importantes.",
  },
]

export const PROBLEM_STATS = [
  {
    value: "5",
    label: "tributos diferentes",
    description: "ICMS, ISS, PIS, Cofins, IPI - cada um com suas próprias regras",
  },
  {
    value: "27",
    label: "legislações estaduais",
    description: "Cada estado com alíquotas e benefícios diferentes",
  },
  {
    value: "1.500+",
    label: "horas/ano",
    description: "Tempo médio gasto por empresas em compliance tributário",
  },
]

export const BEFORE_AFTER = {
  before: {
    title: "Sistema Atual",
    items: [
      "5 tributos sobre consumo",
      "27 legislações estaduais diferentes",
      "Cumulatividade e créditos perdidos",
      "Guerra fiscal entre estados",
      "Complexidade extrema",
    ],
  },
  after: {
    title: "Novo Sistema (2033)",
    items: [
      "3 tributos simplificados (IBS, CBS, IS)",
      "Legislação nacional unificada",
      "Não-cumulatividade plena",
      "Cobrança no destino",
      "Regras claras e transparentes",
    ],
  },
}

export const TRUST_BADGES = [
  {
    title: "Baseado na EC 132/2023",
    description: "Legislação oficial",
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

// Deadline: End of 2026 test period
// Note: The exact penalty deadline is uncertain. 2026 is a test year with reduced penalties.
// Source: LC 214/2025 - 2026 is the "período de teste" with CBS 0.9% + IBS 0.1%
export const TARGET_DATE = new Date("2026-12-31T23:59:59")

export const PENALTY_DEADLINE_INFO = {
  date: "2026",
  title: "Ano de transição e testes",
  description: "2026 é o período de teste da reforma tributária, com alíquotas reduzidas (CBS 0,9% + IBS 0,1%). Durante este período, o fisco está focado em adaptação dos sistemas. A partir de 2027, a CBS entra em vigor efetivamente e as exigências aumentam significativamente.",
  source: "LC 214/2025",
  sourceUrl: "https://www.planalto.gov.br/ccivil_03/leis/lcp/Lcp214.htm"
}
