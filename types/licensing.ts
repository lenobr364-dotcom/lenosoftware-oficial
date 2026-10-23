/** Token opaco emitido por `sealPortalLicenseToken` (4 segmentos). */
export type SealedPortalLicenseToken = string & { readonly __brand: "SealedPortalLicenseToken" };

export function toSealedPortalLicenseToken(raw: string): SealedPortalLicenseToken {
  return raw as SealedPortalLicenseToken;
}

/** Cookie / valor opaco da sessão de licença do núcleo. */
export type CoreLicenseSessionOpaque = string & { readonly __brand: "CoreLicenseSessionOpaque" };

export function toCoreLicenseSessionOpaque(raw: string): CoreLicenseSessionOpaque {
  return raw as CoreLicenseSessionOpaque;
}

/** Payload interno v1 da sessão do núcleo (pós-assinatura). */
export type CoreLicenseSessionPayloadV1 = {
  readonly v: 1;
  readonly exp: number;
  readonly sub: LicensePrincipalId;
};

/** Identificador estável do titular (1–512 chars). */
export type LicensePrincipalId = string & { readonly __brand: "LicensePrincipalId" };

export function toLicensePrincipalId(raw: string): LicensePrincipalId {
  if (raw.length < 1 || raw.length > 512) {
    throw new Error("LicensePrincipalId out of bounds (1–512).");
  }
  return raw as LicensePrincipalId;
}
