import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidade | ImpostoFácil",
  description: "Política de privacidade da plataforma ImpostoFácil",
}

export default function PrivacidadePage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-muted-foreground mb-6">
          Última atualização: Fevereiro de 2026
        </p>

        <p className="mb-6">
          O ImpostoFácil está comprometido com a proteção da sua privacidade. 
          Esta política descreve como coletamos, usamos e protegemos suas informações 
          pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Dados que Coletamos</h2>
          
          <h3 className="text-lg font-medium mt-4 mb-2">1.1 Dados de Cadastro</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Nome completo</li>
            <li>Endereço de e-mail</li>
            <li>Informações da empresa (razão social, CNPJ, regime tributário)</li>
          </ul>

          <h3 className="text-lg font-medium mt-4 mb-2">1.2 Dados de Uso</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Páginas visitadas e tempo de permanência</li>
            <li>Interações com o assistente de IA</li>
            <li>Simulações realizadas</li>
            <li>Preferências e configurações</li>
          </ul>

          <h3 className="text-lg font-medium mt-4 mb-2">1.3 Dados Técnicos</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Endereço IP</li>
            <li>Tipo de navegador e dispositivo</li>
            <li>Sistema operacional</li>
            <li>Cookies e tecnologias similares</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Como Usamos seus Dados</h2>
          <p>Utilizamos suas informações para:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Fornecer e melhorar nossos serviços</li>
            <li>Personalizar sua experiência na plataforma</li>
            <li>Enviar comunicações relevantes (com seu consentimento)</li>
            <li>Gerar relatórios e análises agregados</li>
            <li>Cumprir obrigações legais</li>
            <li>Prevenir fraudes e garantir a segurança</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Base Legal (LGPD)</h2>
          <p>Processamos seus dados com base em:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Consentimento:</strong> Para comunicações de marketing</li>
            <li><strong>Execução de contrato:</strong> Para prestação dos serviços</li>
            <li><strong>Legítimo interesse:</strong> Para melhorar a plataforma</li>
            <li><strong>Obrigação legal:</strong> Para cumprimento de legislação</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Compartilhamento de Dados</h2>
          <p>Não vendemos seus dados. Podemos compartilhá-los com:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Provedores de serviço:</strong> Hospedagem, análise, processamento de pagamentos</li>
            <li><strong>Parceiros de IA:</strong> Para funcionamento do assistente (dados anonimizados)</li>
            <li><strong>Autoridades:</strong> Quando exigido por lei</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Seus Direitos (LGPD)</h2>
          <p>Você tem direito a:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Confirmar a existência de tratamento de dados</li>
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos ou desatualizados</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
            <li>Portabilidade dos dados</li>
            <li>Eliminação dos dados (com exceções legais)</li>
            <li>Revogar consentimento a qualquer momento</li>
          </ul>
          <p className="mt-2">
            Para exercer esses direitos, envie um e-mail para: privacidade@impostofacil.com
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Cookies</h2>
          <p>Utilizamos cookies para:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Essenciais:</strong> Funcionamento básico da plataforma</li>
            <li><strong>Desempenho:</strong> Análise de uso e melhorias</li>
            <li><strong>Funcionalidade:</strong> Lembrar preferências</li>
          </ul>
          <p className="mt-2">
            Você pode gerenciar cookies nas configurações do seu navegador.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. Segurança</h2>
          <p>
            Implementamos medidas técnicas e organizacionais para proteger seus dados:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Criptografia em trânsito (HTTPS/TLS)</li>
            <li>Criptografia em repouso</li>
            <li>Controle de acesso restrito</li>
            <li>Monitoramento contínuo de segurança</li>
            <li>Backups regulares</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">8. Retenção de Dados</h2>
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário 
            para prestação dos serviços. Após solicitação de exclusão, os dados são 
            removidos em até 30 dias, exceto quando houver obrigação legal de retenção.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">9. Menores de Idade</h2>
          <p>
            Nossos serviços não são destinados a menores de 18 anos. Não coletamos 
            intencionalmente dados de menores.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">10. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta política periodicamente. Notificaremos sobre 
            mudanças significativas por e-mail ou aviso na plataforma.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">11. Contato</h2>
          <p>
            <strong>Encarregado de Proteção de Dados (DPO):</strong>
          </p>
          <p>E-mail: privacidade@impostofacil.com</p>
          <p className="mt-2">
            Você também pode registrar reclamação junto à Autoridade Nacional de 
            Proteção de Dados (ANPD).
          </p>
        </section>
      </div>
    </div>
  )
}
