import { NEXUS_HQ, NEXUS_LEGAL } from "@/lib/nexus-legal-identity";

/** Versão dos termos de exclusividade / comissão BritaGrid × Leno.software */
export const BRITAGRID_EXCLUSIVITY_VERSION = "bg-exclusivity-2026.1";

export const BRITAGRID_OPERATOR = {
  brand: "BritaGrid Brasil",
  holding: "Leno.software",
  legalName: NEXUS_LEGAL.company,
  cnpj: NEXUS_HQ.cnpj,
  city: NEXUS_HQ.city,
  state: NEXUS_HQ.state,
} as const;

export const ANTI_DISINTERMEDIATION_NOTICE =
  "A troca de contato direto (telefone, WhatsApp, e-mail, redes sociais ou links externos) entre locador e locatário antes do fechamento e liberação autorizada pela BritaGrid viola os termos da plataforma e sujeita a conta a bloqueio e multa contratual perante a Leno.software.";

export type ExclusivitySection = {
  id: string;
  title: string;
  body: string;
};

export function getExclusivityTerms(): {
  version: string;
  title: string;
  operatorLine: string;
  notice: string;
  sections: ExclusivitySection[];
} {
  const { brand, holding, cnpj, legalName } = BRITAGRID_OPERATOR;
  return {
    version: BRITAGRID_EXCLUSIVITY_VERSION,
    title: "Termos de exclusividade e comissão — BritaGrid Brasil",
    operatorLine: `${brand} operada por ${holding} (${legalName}) · CNPJ ${cnpj}`,
    notice: ANTI_DISINTERMEDIATION_NOTICE,
    sections: [
      {
        id: "exclusivity",
        title: "1. Exclusividade da intermediação",
        body: `Toda negociação, solicitação de locação, proposta e aceite de britagem móvel devem ocorrer exclusivamente no fluxo interno da ${brand}. Locadores e locatários reconhecem que a ${holding} é a intermediária obrigatória até a formalização e liberação de contatos autorizada pela plataforma.`,
      },
      {
        id: "commission",
        title: "2. Comissão e remuneração",
        body: `Ao aceitar uma proposta, as partes reconhecem a comissão de intermediação devida à ${holding} (CNPJ ${cnpj}) sobre a locação fechada via ${brand}, conforme tabela comercial vigente no momento do aceite.`,
      },
      {
        id: "contact-ban",
        title: "3. Proibição de desintermediação",
        body: ANTI_DISINTERMEDIATION_NOTICE,
      },
      {
        id: "sanctions",
        title: "4. Sanções",
        body: `A tentativa de burlar o mascaramento de contatos, inserir dados de contato em descrições/observações/chat ou fechar locação por fora da plataforma autoriza a ${holding} a suspender ou bloquear contas, cancelar propostas e aplicar multa contratual, sem prejuízo de outras medidas legais.`,
      },
      {
        id: "release",
        title: "5. Liberação de contatos",
        body: "Telefones, WhatsApp, e-mails e perfis sociais só são revelados após formalização do contrato na plataforma e liberação explícita autorizada pela BritaGrid.",
      },
    ],
  };
}

export type ExclusivityAcceptanceRecord = {
  accepted: true;
  version: string;
  acceptedAt: string;
  actorId: string;
  actorRole: "locador" | "locatario" | "operador";
  proposalId: string;
  cnpjAcknowledged: string;
};
