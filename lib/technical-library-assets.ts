import type { TechnicalLibraryDocumentId } from "@/lib/technical-library-catalog";

/** PDF mínimo válido (1 página vazia) — stub até existirem PDFs reais em storage. */
const MINIMAL_PDF_BYTES = Buffer.from(
  [
    "%PDF-1.4",
    "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj",
    "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj",
    "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj",
    "xref",
    "0 4",
    "0000000000 65535 f",
    "0000000009 00000 n",
    "0000000052 00000 n",
    "0000000101 00000 n",
    "trailer<</Size 4/Root 1 0 R>>",
    "startxref",
    "178",
    "%%EOF",
  ].join("\n"),
  "latin1",
);

const INDUSTRIAL_SCALE_GUIDE_TEXT = `ChemVault Global — Industrial Batch Processing Guide (stub)
BIJU Global Technology

This placeholder will be replaced by the full industrial batch processing guide for approved licensees.

Sections (planned):
- Batch sizing and dilution checkpoints
- QC sampling at scale
- Regulatory documentation trail

Access: downloads are restricted to leads with approved commercial status in the ChemVault pipeline.
`;

export function getTechnicalLibraryAssetBytes(id: TechnicalLibraryDocumentId): Buffer {
  switch (id) {
    case "chemical-safety-manual":
      return MINIMAL_PDF_BYTES;
    case "industrial-scale-guide":
      return Buffer.from(INDUSTRIAL_SCALE_GUIDE_TEXT, "utf8");
  }
}

export function getTechnicalLibraryContentType(id: TechnicalLibraryDocumentId): string {
  switch (id) {
    case "chemical-safety-manual":
      return "application/pdf";
    case "industrial-scale-guide":
      return "text/plain; charset=utf-8";
  }
}
