/**
 * Catálogo da Biblioteca Técnica (metadados).
 * Ficheiros servidos via GET /api/technical-library/[documentId] com gate em technical-library-access.
 */

export type TechnicalLibraryFormat = "pdf" | "text";

export type TechnicalLibraryDocumentId = "chemical-safety-manual" | "industrial-scale-guide";

export type TechnicalLibraryDocument = {
  id: TechnicalLibraryDocumentId;
  format: TechnicalLibraryFormat;
  /** Nome sugerido para Content-Disposition (ASCII) */
  downloadFilename: string;
};

export const TECHNICAL_LIBRARY_DOCUMENTS: readonly TechnicalLibraryDocument[] = [
  {
    id: "chemical-safety-manual",
    format: "pdf",
    downloadFilename: "chemvault-chemical-safety-manual.pdf",
  },
  {
    id: "industrial-scale-guide",
    format: "text",
    downloadFilename: "chemvault-industrial-scale-guide.txt",
  },
] as const;

export function getTechnicalLibraryDocument(
  documentId: string,
): TechnicalLibraryDocument | undefined {
  return TECHNICAL_LIBRARY_DOCUMENTS.find((d) => d.id === documentId);
}
