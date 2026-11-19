import { NextResponse } from "next/server";

// Registro interno de licenças ChemVault — Leno.Software.
const auditLogs = [
  { id: "LIC-2026-001", company: "BIJU TECH", chemicalFormula: "Fórmula de Limpeza Concentrada v2", status: "Finalizado", timestamp: "2026-05-16T13:35:00Z" },
];

export async function GET(_request: Request) {
  try {
    return NextResponse.json({
      success: true,
      organization: "Leno.Software",
      cnpj: "36.962.878/0001-55",
      product: "ChemVault Global",
      data: auditLogs
    }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { licenseId, action } = body;

    if (!licenseId || !action) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    console.log(`[AUDIT TRAIL] Evento '${action}' registrado para a licença ${licenseId} às ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: `Evento '${action}' processado e integrado ao Security Audit com sucesso.`,
      eventLoggedAt: new Date().toISOString()
    }, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ success: false, error: "Invalid Request Body" }, { status: 400 });
  }
}