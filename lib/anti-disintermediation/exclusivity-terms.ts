import { NEXUS_HQ, NEXUS_LEGAL } from "@/lib/nexus-legal-identity";

/** Versão dos termos de exclusividade / comissão no fluxo comercial Leno.software */
export const LENO_EXCLUSIVITY_VERSION = "leno-exclusivity-2026.1";

export const LENO_OPERATOR = {
  brand: "Leno.Software",
  holding: "Leno.software",
  legalName: NEXUS_LEGAL.company,
  cnpj: NEXUS_HQ.cnpj,
  city: NEXUS_HQ.city,
  state: NEXUS_HQ.state,
} as const;

export const EXPECTED_LENO_CNPJ = "36.962.878/0001-55";

export const ANTI_DISINTERMEDIATION_NOTICE =
  "A troca de contato direto (telefone, WhatsApp, e-mail, redes sociais ou links externos) entre as partes antes do fechamento e liberação autorizada pela plataforma viola os termos e sujeita a conta a bloqueio e multa contratual perante a Leno.software.";

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
  const { brand, holding, cnpj, legalName } = LENO_OPERATOR;
  return {
    version: LENO_EXCLUSIVITY_VERSION,
    title: "Termos de exclusividade e comissão — Leno.software",
    operatorLine: `${brand} (${legalName}) · CNPJ ${cnpj}`,
    notice: ANTI_DISINTERMEDIATION_NOTICE,
    sections: [
      {
        id: "exclusivity",
        title: "1. Exclusividade da intermediação",
        body: `Toda negociação, solicitação, proposta e aceite de equipamentos/serviços devem ocorrer exclusivamente no fluxo interno da ${brand}. As partes reconhecem que a ${holding} é a intermediária obrigatória até a formalização e liberação de contatos autorizada pela plataforma.`,
      },
      {
        id: "commission",
        title: "2. Comissão e remuneração",
        body: `Ao aceitar uma proposta ou concluir pagamento (incluindo Pix Santander PJ), as partes reconhecem a comissão de intermediação devida à ${holding} (CNPJ ${cnpj}): 2,5% sobre locações de assinantes dos planos Operador/Locador (R$ 497/mês) ou Frota Enterprise (R$ 1.490/mês), e 4,0% sobre locações avulsas. A comissão está vinculada a este termo de exclusividade/anti-bypass.`,
      },
      {
        id: "contact-ban",
        title: "3. Proibição de desintermediação",
        body: ANTI_DISINTERMEDIATION_NOTICE,
      },
      {
        id: "sanctions",
        title: "4. Sanções",
        body: `A tentativa de burlar o mascaramento de contatos, inserir dados de contato em descrições/observações/chat ou fechar negócio por fora da plataforma autoriza a ${holding} a suspender ou bloquear contas, cancelar propostas e aplicar multa contratual, sem prejuízo de outras medidas legais.`,
      },
      {
        id: "release",
        title: "5. Liberação de contatos",
        body: "Telefones, WhatsApp, e-mails e perfis sociais só são revelados após aceite formal dos termos, pagamento (Pix/checkout) e liberação explícita autorizada pela plataforma.",
      },
    ],
  };
}

export function normalizeCnpjDigits(value: string): string {
  return (value || "").replace(/\D/g, "");
}

export function isExpectedLenoCnpj(value: string): boolean {
  return normalizeCnpjDigits(value) === normalizeCnpjDigits(EXPECTED_LENO_CNPJ);
}

export type ExclusivityAcceptanceRecord = {
  accepted: true;
  version: string;
  acceptedAt: string;
  actorId: string;
  actorRole: "locador" | "locatario" | "operador" | "cliente";
  proposalId: string;
  cnpjAcknowledged: string;
};
