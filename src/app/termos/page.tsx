import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Termos de Uso | ImpostoFácil",
  description: "Termos de uso da plataforma ImpostoFácil",
}

export default function TermosPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-8">Termos de Uso</h1>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-muted-foreground mb-6">
          Última atualização: Fevereiro de 2026
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e utilizar a plataforma ImpostoFácil, você concorda com estes 
            Termos de Uso. Se você não concordar com qualquer parte destes termos, 
            não utilize nossos serviços.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Descrição do Serviço</h2>
          <p>
            O ImpostoFácil é uma plataforma educacional que oferece informações sobre 
            a reforma tributária brasileira (EC 132/2023, LC 214/2025), incluindo:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Simulador de impacto tributário</li>
            <li>Base de conhecimento sobre IBS, CBS e IS</li>
            <li>Assistente de IA para dúvidas sobre a reforma</li>
            <li>Alertas e notificações sobre prazos importantes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Natureza Informativa</h2>
          <p>
            <strong>IMPORTANTE:</strong> As informações fornecidas pelo ImpostoFácil 
            são de natureza educacional e informativa. Elas <strong>não constituem</strong> 
            aconselhamento jurídico, contábil ou tributário profissional.
          </p>
          <p className="mt-2">
            Para decisões específicas sobre sua situação tributária, consulte sempre 
            um contador, advogado tributarista ou outro profissional qualificado.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Conta de Usuário</h2>
          <p>
            Para acessar determinadas funcionalidades, você pode precisar criar uma conta. 
            Você é responsável por:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Manter a confidencialidade de suas credenciais</li>
            <li>Todas as atividades realizadas em sua conta</li>
            <li>Fornecer informações precisas e atualizadas</li>
            <li>Notificar-nos sobre qualquer uso não autorizado</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Uso Aceitável</h2>
          <p>Você concorda em não:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Usar o serviço para fins ilegais</li>
            <li>Tentar acessar áreas não autorizadas do sistema</li>
            <li>Interferir no funcionamento da plataforma</li>
            <li>Copiar ou distribuir conteúdo sem autorização</li>
            <li>Usar automação para acessar o serviço de forma abusiva</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo da plataforma, incluindo textos, gráficos, logos, ícones e 
            software, é propriedade do ImpostoFácil ou de seus licenciadores e é protegido 
            por leis de propriedade intelectual.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. Limitação de Responsabilidade</h2>
          <p>
            O ImpostoFácil não se responsabiliza por:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Decisões tomadas com base nas informações da plataforma</li>
            <li>Perdas financeiras ou tributárias decorrentes do uso do serviço</li>
            <li>Imprecisões ou desatualização das informações</li>
            <li>Interrupções temporárias do serviço</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">8. Modificações</h2>
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. 
            Alterações significativas serão comunicadas por e-mail ou através de 
            aviso na plataforma.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">9. Lei Aplicável</h2>
          <p>
            Estes termos são regidos pelas leis da República Federativa do Brasil. 
            Qualquer disputa será resolvida no foro da comarca de São Paulo/SP.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">10. Contato</h2>
          <p>
            Para dúvidas sobre estes termos, entre em contato conosco através do 
            e-mail: contato@impostofacil.com
          </p>
        </section>
      </div>
    </div>
  )
}
