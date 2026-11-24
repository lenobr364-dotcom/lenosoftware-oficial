export {
  CONTACT_MASK,
  LINK_MASK,
  HANDLE_MASK,
  PHONE_PATTERN,
  WHATSAPP_PATTERN,
  EMAIL_PATTERN,
  SOCIAL_HANDLE_PATTERN,
  EXTERNAL_LINK_PATTERN,
  SOCIAL_URL_HINT_PATTERN,
  maskContactText,
  sanitizeUserInput,
  containsBlockedContact,
  maskPublicContactFields,
  maskTextFields,
  maskEmailDisplay,
  type ContactHit,
  type ContactHitKind,
  type SanitizeResult,
  type PublicContactFields,
} from "./contact-sanitize";

export {
  LENO_EXCLUSIVITY_VERSION,
  LENO_OPERATOR,
  EXPECTED_LENO_CNPJ,
  ANTI_DISINTERMEDIATION_NOTICE,
  getExclusivityTerms,
  normalizeCnpjDigits,
  isExpectedLenoCnpj,
  type ExclusivitySection,
  type ExclusivityAcceptanceRecord,
} from "./exclusivity-terms";

export {
  calculateCostPerTon,
  calculateMachineHourCost,
  type CostPerTonInput,
  type CostPerTonResult,
  type MachineHourInput,
  type MachineHourResult,
} from "./calculators";
