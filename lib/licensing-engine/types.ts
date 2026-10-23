export type LicenseEngineStatus = "PENDING" | "ACTIVE" | "REVOKED";

export type LicenseValidity = "VALID" | "EXPIRED" | "REVOKED" | "NOT_YET_VALID" | "PENDING";

export type FormulaLicenseRow = {
  id: string;
  formulaId: string;
  clientSubject: string;
  formulaCode: string;
  formulaName: string;
  status: LicenseEngineStatus;
  validity: LicenseValidity;
  validFrom: string;
  validUntil: string;
  grantHash: string;
  chainAnchor: string | null;
  createdAt: string;
};

export type LicensingEnginePage = {
  items: FormulaLicenseRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  metrics: {
    pending: number;
    active: number;
    revoked: number;
  };
};

export type LicensingEngineQuery = {
  page?: number;
  pageSize?: number;
  status?: LicenseEngineStatus | "all";
};
