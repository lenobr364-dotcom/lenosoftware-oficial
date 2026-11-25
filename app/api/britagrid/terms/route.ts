import { NextResponse } from "next/server";

import { getExclusivityTerms } from "@/lib/britagrid/exclusivity-terms";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, terms: getExclusivityTerms() });
}
