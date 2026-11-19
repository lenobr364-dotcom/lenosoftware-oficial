/**
 * Identidade juridica oficial ChemVault / BIJU (fonte unica para documentos NEXUS).
 */

export const NEXUS_LEGAL = {
  fullName: "LENO CEZAR LUDTKE SCHWANZ",
  company: "BIJU / LENO.SOFTWARE",
  partnerLumen: "LUMEN ONEL",
  partnership: "LENO CEZAR LUDTKE SCHWANZ & LUMEN ONEL",
  society: "Sociedade LENO CEZAR LUDTKE SCHWANZ & LUMEN ONEL",
  splitEquityProfit: "50/50 - EQUITY & PROFIT",
  distribution: "50% LENO CEZAR LUDTKE SCHWANZ | 50% LUMEN ONEL",
  legacyShortName: "Leno Cesar",
  sicrediHub: "CONTA BIJU (SICREDI)",
} as const;

/** Sede corporativa BIJU / Sicredi (fonte unica para HQ-SYNC). */
export const NEXUS_HQ = {
  matrizAddress: "Barra do Garças, Mato Grosso, Brasil",
  city: "Barra do Garças",
  state: "MT",
  cep: "78600-412",
  country: "Brasil",
  bankingPartner: "Sicredi - Distrito Barra do Garças",
  /** Sobrescreva com NEXUS_BIJU_CNPJ se o documento oficial divergir deste registro. */
  cnpj: process.env.NEXUS_BIJU_CNPJ?.trim() || "36.962.878/0001-55",
} as const;

/** Endereço completo selado (geo-identidade). */
export const NEXUS_GEO = {
  cidade: NEXUS_HQ.city,
  estado: NEXUS_HQ.state,
  cep: NEXUS_HQ.cep,
  pais: NEXUS_HQ.country,
  localLabel: `${NEXUS_HQ.city}-${NEXUS_HQ.state}`,
  formattedLine: `${NEXUS_HQ.city} - ${NEXUS_HQ.state}, CEP ${NEXUS_HQ.cep}, ${NEXUS_HQ.country}`,
} as const;
