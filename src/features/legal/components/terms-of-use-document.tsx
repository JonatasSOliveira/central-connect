import Link from "next/link";

const TERMS_VERSION = "v1.0";
const EFFECTIVE_DATE = "16/04/2026";
const UPDATED_AT = "16/04/2026";

const sections = [
  {
    title: "1. Objeto",
    content:
      "Os presentes Termos de Uso disciplinam o acesso e a utilização da plataforma Central Connect, destinada ao cadastro de membros e à gestão de escalas ministeriais da Central do Avivamento.",
  },
  {
    title: "2. Aceite e vinculação",
    content:
      "Ao prosseguir com o cadastro e utilizar a Plataforma, o USUÁRIO declara que leu, compreendeu e aceitou integralmente estes Termos, bem como a Política de Privacidade aplicável. O aceite eletrônico possui validade jurídica e vincula as partes.",
  },
  {
    title: "3. Elegibilidade e cadastro",
    content:
      "O uso da Plataforma é restrito a pessoas físicas aptas para atos da vida civil. O USUÁRIO compromete-se a fornecer informações verídicas, atualizadas e completas, respondendo civil e legalmente por eventual falsidade, omissão ou uso indevido de dados.",
  },
  {
    title: "4. Autenticação por conta Google",
    content:
      "O acesso e a finalização de cadastro dependem de autenticação por conta Google. O USUÁRIO reconhece que a autenticação envolve serviço de terceiro, sujeito aos respectivos termos e políticas, não sendo a Central do Avivamento responsável por indisponibilidades, falhas ou bloqueios externos ao seu controle.",
  },
  {
    title: "5. Regras de uso da Plataforma",
    content:
      "A Plataforma deverá ser utilizada exclusivamente para finalidades legítimas relacionadas à organização interna, participação em escalas e comunicações ministeriais. É vedada qualquer utilização para finalidade ilícita, abusiva ou que contrarie a boa-fé objetiva.",
  },
  {
    title: "6. Obrigações do USUÁRIO",
    content:
      "Constituem obrigações do USUÁRIO: (i) manter a segurança de suas credenciais; (ii) não compartilhar acesso com terceiros; (iii) comunicar uso não autorizado de sua conta; (iv) manter seus dados atualizados; e (v) observar integralmente estes Termos e a legislação vigente.",
  },
  {
    title: "7. Vedações e condutas proibidas",
    content:
      "É expressamente proibido: violar direitos de terceiros; inserir conteúdo ofensivo, discriminatório ou ilícito; praticar engenharia reversa, tentativa de invasão, fraude, sobrecarga, scraping indevido ou qualquer conduta que comprometa a segurança, disponibilidade e integridade da Plataforma.",
  },
  {
    title: "8. Propriedade intelectual",
    content:
      "Todos os direitos de propriedade intelectual sobre marca, layout, código-fonte, documentação e demais elementos da Plataforma pertencem aos titulares legítimos, sendo vedada reprodução, distribuição ou exploração sem autorização prévia e expressa.",
  },
  {
    title: "9. Disponibilidade, manutenção e alterações técnicas",
    content:
      "A Central do Avivamento envidará esforços razoáveis para manter a Plataforma disponível, podendo realizar manutenções, atualizações e interrupções técnicas programadas ou emergenciais, sem que isso gere direito automático à indenização.",
  },
  {
    title: "10. Limitação de responsabilidade",
    content:
      "Na máxima extensão permitida pela legislação aplicável, a Central do Avivamento não se responsabiliza por danos indiretos, lucros cessantes, perda de oportunidade ou prejuízos decorrentes de culpa exclusiva do USUÁRIO, de terceiros ou de indisponibilidade de serviços externos integrados.",
  },
  {
    title: "11. Suspensão e encerramento de acesso",
    content:
      "O acesso poderá ser suspenso, restringido ou encerrado, a qualquer tempo, em caso de violação destes Termos, suspeita de fraude, determinação legal ou risco à segurança da Plataforma, sem prejuízo das medidas administrativas, civis e penais cabíveis.",
  },
  {
    title: "12. Atualização dos Termos",
    content:
      "Estes Termos poderão ser atualizados periodicamente para refletir alterações legais, regulatórias, operacionais ou técnicas. A versão vigente será publicada nesta página, com indicação de data e versão, produzindo efeitos a partir de sua publicação.",
  },
  {
    title: "13. Contato",
    content:
      "Para dúvidas, solicitações e comunicações relacionadas a estes Termos, o USUÁRIO poderá contatar a Central do Avivamento pelo e-mail: contato.milnatix@gmail.com.",
  },
  {
    title: "14. Lei aplicável e foro",
    content:
      "Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de Paranavaí/PR, com renúncia expressa a qualquer outro, por mais privilegiado que seja, para dirimir questões oriundas destes Termos.",
  },
];

export function TermsOfUseDocument() {
  return (
    <article className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
      <header className="space-y-2 border-b border-border pb-5">
        <h1 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
          Termos de Uso - Central Connect
        </h1>
        <p className="text-sm text-muted-foreground">Versão: {TERMS_VERSION}</p>
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
          Este documento deve ser lido em conjunto com a Política de
          Privacidade, disponível em{" "}
          <Link href="/legal/privacy-policy" className="text-primary underline">
            /legal/privacy-policy
          </Link>
          .
        </p>
      </footer>
    </article>
  );
}
