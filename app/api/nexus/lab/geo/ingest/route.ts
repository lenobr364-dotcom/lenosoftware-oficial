import { NextRequest } from "next/server";

import { requireNexusLabApiAccess, nexusLabJsonResponse } from "@/lib/api/nexus-lab-guard";
import { ingestGeographicXml } from "@/lib/services/operations-map.service";

export const dynamic = "force-dynamic";

const MAX_XML_BYTES = 2 * 1024 * 1024;

/**
 * POST — ingestão de XML geográfico (SIRGAS / UTM / GML / KML).
 * Body: raw XML text ou multipart field "file".
 */
export async function POST(request: NextRequest) {
  const guard = await requireNexusLabApiAccess(request);
  if (guard instanceof Response) return guard;

  const contentType = request.headers.get("content-type") ?? "";

  try {
    let fileName = "upload.xml";
    let xml = "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (file instanceof File) {
        if (file.size > MAX_XML_BYTES) {
          return nexusLabJsonResponse({ ok: false, error: "file_too_large" }, { status: 413, cache: "noStore" });
        }
        fileName = file.name || fileName;
        xml = await file.text();
      } else {
        const raw = form.get("xml");
        if (typeof raw === "string") xml = raw;
      }
    } else {
      const buf = await request.arrayBuffer();
      if (buf.byteLength > MAX_XML_BYTES) {
        return nexusLabJsonResponse({ ok: false, error: "body_too_large" }, { status: 413, cache: "noStore" });
      }
      xml = new TextDecoder().decode(buf);
      fileName = request.headers.get("x-file-name") ?? fileName;
    }

    if (!xml.trim()) {
      return nexusLabJsonResponse({ ok: false, error: "empty_payload" }, { status: 400, cache: "noStore" });
    }

    if (!xml.trimStart().startsWith("<")) {
      return nexusLabJsonResponse({ ok: false, error: "invalid_xml" }, { status: 400, cache: "noStore" });
    }

    const result = await ingestGeographicXml(fileName, xml);
    return nexusLabJsonResponse({ ok: true, result }, { status: 201, cache: "noStore" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "geo_ingest_failed";
    return nexusLabJsonResponse({ ok: false, error: message }, { status: 500, cache: "noStore" });
  }
}
