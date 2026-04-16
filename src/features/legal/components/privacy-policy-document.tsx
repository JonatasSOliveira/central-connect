import Link from "next/link";
import { PRIVACY_POLICY_VERSION } from "@/shared/constants/legal";

const EFFECTIVE_DATE = "16/04/2026";
const UPDATED_AT = "16/04/2026";

const sections = [
  {
    title: "1. Objeto e escopo",
    content:
      "A presente Política de Privacidade estabelece as diretrizes para o tratamento de dados pessoais no âmbito da plataforma Central Connect, utilizada para cadastro de membros e gestão de escalas ministeriais da Central do Avivamento.",
  },
  {
    title: "2. Identificação da Controladora",
    content:
      "A Controladora dos dados pessoais tratados por meio da Plataforma é a CENTRAL DO AVIVAMENTO (Ministério Central do Avivamento de Paranavaí), inscrita no CNPJ sob o nº 08.517.174/0001-38.",
  },
  {
    title: "3. Dados pessoais tratados",
    content:
      "Podem ser tratados, conforme o fluxo de uso: nome completo, telefone, e-mail proveniente da autenticação Google, identificadores internos de vinculação à igreja, registros de uso da aplicação e dados técnicos necessários à segurança e operação da Plataforma.",
  },
  {
    title: "4. Finalidades do tratamento",
    content:
      "Os dados pessoais são tratados para: (i) autenticar o USUÁRIO; (ii) viabilizar cadastro e atualização de membro; (iii) vincular o membro à igreja correta; (iv) permitir a organização de escalas; (v) prevenir fraudes e incidentes de segurança; e (vi) cumprir obrigações legais e regulatórias.",
  },
  {
    title: "5. Bases legais aplicáveis",
    content:
      "O tratamento poderá ocorrer com fundamento nas bases legais previstas na Lei nº 13.709/2018 (LGPD), incluindo, quando aplicável: consentimento do titular, execução de procedimentos preliminares e de relação contratual, cumprimento de obrigação legal/regulatória e legítimo interesse, observados os limites legais.",
  },
  {
    title: "6. Compartilhamento de dados",
    content:
      "Os dados poderão ser compartilhados com operadores e prestadores estritamente necessários à prestação do serviço, incluindo provedores de infraestrutura e autenticação, como Firebase/Google, sempre sob medidas de segurança e confidencialidade adequadas.",
  },
  {
    title: "7. Transferência internacional de dados",
    content:
      "Em razão da utilização de provedores de tecnologia com infraestrutura global, poderá haver transferência internacional de dados, observadas as exigências da LGPD e a adoção de salvaguardas adequadas para proteção dos titulares.",
  },
  {
    title: "8. Retenção e descarte",
    content:
      "Os dados serão mantidos pelo período necessário ao cumprimento das finalidades desta Política e das obrigações legais aplicáveis. Encerrada a necessidade, os dados serão eliminados, anonimizados ou mantidos de forma bloqueada, conforme permitido pela legislação.",
  },
  {
    title: "9. Segurança da informação",
    content:
      "A Controladora adota medidas técnicas e administrativas razoáveis para proteger os dados pessoais contra acesso não autorizado, perda, destruição, alteração ou qualquer forma de tratamento inadequado ou ilícito.",
  },
  {
    title: "10. Direitos do titular",
    content:
      "Nos termos do art. 18 da LGPD, o titular pode solicitar, quando aplicável: confirmação da existência de tratamento, acesso, correção, anonimização, bloqueio, eliminação, portabilidade, informação sobre compartilhamentos, revogação de consentimento e revisão de decisões automatizadas, quando cabível.",
  },
  {
    title: "11. Canal de atendimento ao titular",
    content:
      "Solicitações relacionadas a dados pessoais poderão ser encaminhadas para contato.milnatix@gmail.com. A Controladora poderá solicitar informações adicionais para validação da identidade do solicitante, visando preservar a segurança dos dados.",
  },
  {
    title: "12. Cookies e tecnologias correlatas",
    content:
      "A Plataforma pode utilizar mecanismos técnicos indispensáveis ao funcionamento, autenticação e segurança da sessão. Eventuais tecnologias adicionais serão tratadas conforme sua natureza e finalidade, com observância da legislação aplicável.",
  },
  {
    title: "13. Atualizações desta Política",
    content:
      "Esta Política poderá ser alterada a qualquer tempo para refletir mudanças legais, regulatórias, operacionais ou técnicas. A versão vigente permanecerá disponível nesta página, com identificação de data e versão.",
  },
  {
    title: "14. Legislação aplicável e foro",
    content:
      "Esta Política é regida pelas leis da República Federativa do Brasil, especialmente a LGPD. Fica eleito o foro da Comarca de Paranavaí/PR para dirimir controvérsias dela decorrentes, sem prejuízo das competências legais específicas.",
  },
];

export function PrivacyPolicyDocument() {
  return (
    <article className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
      <header className="space-y-2 border-b border-border pb-5">
        <h1 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
          Política de Privacidade - Central Connect
        </h1>
        <p className="text-sm text-muted-foreground">
          Versão: {PRIVACY_POLICY_VERSION}
        </p>
        <p className="text-sm text-muted-foreground">
          Data de vigência: {EFFECTIVE_DATE}
        </p>
        <p className="text-sm text-muted-foreground">
          Última atualização: {UPDATED_AT}
        </p>
      </header>

      <section className="mt-6 space-y-2 rounded-xl border border-border bg-muted/40 p-4 text-sm text-foreground">
        <p>
          <strong>Nome Fantasia:</strong> Central do Avivamento
        </p>
        <p>
          <strong>Razão Social:</strong> Ministério Central do Avivamento de
          Paranavaí
        </p>
        <p>
          <strong>CNPJ:</strong> 08.517.174/0001-38
        </p>
        <p>
          <strong>Contato:</strong> contato.milnatix@gmail.com
        </p>
      </section>

      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="space-y-2">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {section.title}
            </h2>
            <p className="text-sm leading-6 text-foreground">
              {section.content}
            </p>
          </section>
        ))}
      </div>

      <footer className="mt-10 rounded-xl border border-border bg-muted/40 p-4 text-sm text-foreground">
        <p>
          Este documento deve ser lido em conjunto com os Termos de Uso,
          disponíveis em{" "}
          <Link href="/legal/terms-of-use" className="text-primary underline">
            /legal/terms-of-use
          </Link>
          .
        </p>
      </footer>
    </article>
  );
}
