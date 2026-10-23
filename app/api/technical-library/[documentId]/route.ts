import { NextRequest, NextResponse } from "next/server";

import { canDownloadTechnicalLibrary } from "@/lib/technical-library-access";
import { getTechnicalLibraryAssetBytes, getTechnicalLibraryContentType } from "@/lib/technical-library-assets";
import { getTechnicalLibraryDocument } from "@/lib/technical-library-catalog";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await context.params;
  const doc = getTechnicalLibraryDocument(documentId);
  if (!doc) {
    return NextResponse.json({ error: "Unknown document" }, { status: 404 });
  }

  const authorized = await canDownloadTechnicalLibrary(request.cookies);
  if (!authorized) {
    return NextResponse.json(
      {
        error: "Forbidden",
        hint: "Technical library downloads require an approved licensee session or an authorized executive session.",
      },
      { status: 403 },
    );
  }

  const bytes = getTechnicalLibraryAssetBytes(doc.id);
  const headers = new Headers();
  headers.set("Content-Type", getTechnicalLibraryContentType(doc.id));
  headers.set("Content-Disposition", `attachment; filename="${doc.downloadFilename}"`);
  headers.set("Cache-Control", "private, no-store");

  return new NextResponse(new Uint8Array(bytes), { status: 200, headers });
}
