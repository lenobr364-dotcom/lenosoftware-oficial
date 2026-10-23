/**
 * MFA empresarial para administradores (CEO dashboard).
 * Extensível: TOTP (autenticador) e OTP por e-mail; ativar com CHEMVAULT_ADMIN_MFA.
 */
export {
  activeAdminMfaFactor,
  adminMfaEnabled,
  parseMfaRaw,
  pickActiveFactorFromFactors,
  readAdminMfaFactors,
  type AdminMfaFactor,
} from "./policy";
export { activeAdminMfaFactorAsync, resolvedTotpSecret } from "./resolver";
export {
  buildEmailOtpPending,
  buildTotpPending,
  CEO_MFA_PENDING_COOKIE,
  verifyEmailOtpCode,
  verifyMfaPendingToken,
  type MfaPendingPayload,
} from "./pending-token";
export { generateTotpSecretBase32, verifyTotp } from "./totp";
export {
  buildTotpEnrollPending,
  CEO_TOTP_ENROLL_COOKIE,
  verifyTotpEnrollToken,
} from "./totp-enroll-pending";
