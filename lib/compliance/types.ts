import type { FormulaLicenseRow, LicensingEnginePage } from "@/lib/licensing-engine/types";

export type ComplianceLicensePage = LicensingEnginePage;

export type ComplianceCertificateLicense = {
  id: string;
  formulaCode: string;
  formulaName: string;
  clientSubject: string;
  status: string;
  validity: FormulaLicenseRow["validity"];
  grantHash: string;
  chainAnchor: string | null;
  validFrom: string;
  validUntil: string;
};

export type ComplianceCertificatePayload = {
  documentId: string;
  type: "COMPLIANCE_CERTIFICATE_V1";
  issuedAt: string;
  license: ComplianceCertificateLicense;
  regulatory: {
    signatureAlgorithm: "SHA-256";
    documentDigest: string;
    verificationKey: string;
  };
  issuer: {
    platform: "ChemVault Global";
    actorSubject: string;
  };
};

export type ComplianceAuditExportFormat = "csv" | "json";

export type ComplianceAuditExportPayload = {
  documentId: string;
  type: "AUDIT_REPORT_EXPORT_V1";
  exportedAt: string;
  format: ComplianceAuditExportFormat;
  rowCount: number;
  regulatory: {
    signatureAlgorithm: "SHA-256";
    documentDigest: string;
    verificationKey: string;
  };
  issuer: {
    platform: "ChemVault Global";
    actorSubject: string;
  };
  content: string;
  filename: string;
  mimeType: string;
};
