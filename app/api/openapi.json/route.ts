import { NextResponse } from "next/server";

import { buildOpenApiDocument } from "@/lib/openapi-spec";

/** OpenAPI 3 document for partners and future AI agent tooling. */
export async function GET() {
  const doc = buildOpenApiDocument();
  return NextResponse.json(doc, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
