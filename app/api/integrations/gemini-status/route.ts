import { readGeminiLinkStatus } from "@/lib/gemini-health";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Runtime Gemini API probe (Google AI Studio key). */
export async function GET() {
  const status = await readGeminiLinkStatus();
  return NextResponse.json(status);
}
