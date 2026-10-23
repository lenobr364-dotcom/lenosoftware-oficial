/** Erros verbosos para laboratório (stack/códigos em respostas JSON). */
export function isLabVerboseErrors(): boolean {
  return process.env.LAB_VERBOSE_ERRORS?.trim() === "true" || process.env.NODE_ENV !== "production";
}
