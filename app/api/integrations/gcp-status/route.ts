import { readGcpLinkStatus } from "@/lib/gcp-link-status";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Base para monitorização Google Cloud (MVP: estado a partir de env). */
export async function GET() {
  return NextResponse.json(readGcpLinkStatus());
}
