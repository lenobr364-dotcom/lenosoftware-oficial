/**
 * Tipos — gestão de contratos de licenciamento ChemVault Global.
 */

export type ContractKind = "industrial_grant" | "license_request";

export type ContractDisplayStatus = "active" | "pending" | "expired" | "revoked";

export type SignatureStepId =
  | "draft"
  | "terms_generated"
  | "awaiting_signature"
  | "signed"
  | "anchored";

export type SignatureWorkflow = {
  currentStep: SignatureStepId;
  termsVersion: string | null;
  termsGeneratedAt: string | null;
  sentForSignatureAt: string | null;
  signedAt: string | null;
  anchoredAt: string | null;
  signerEmail?: string;
};

export type LicensingContractRow = {
  id: string;
  kind: ContractKind;
  clientLabel: string;
  subjectCode: string;
  formulaOrCompany: string;
  displayStatus: ContractDisplayStatus;
  validityKey: string;
  validFrom: string | null;
  validUntil: string | null;
  grantHash: string | null;
  chainAnchor: string | null;
  signature: SignatureWorkflow;
  createdAt: string;
  country?: string;
};

export type ContractTermsPayload = {
  contractId: string;
  version: string;
  legalLang: string;
  title: string;
  ipLine: string;
  sections: Array<{ heading: string; body: string }>;
  generatedAt: string;
};

export type LicensingContractsPayload = {
  locale: string;
  updatedAt: string;
  contracts: LicensingContractRow[];
  counts: {
    active: number;
    pending: number;
    expired: number;
    total: number;
  };
};
