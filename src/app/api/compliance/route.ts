import { NextResponse } from "next/server";

// Simulação de banco de dados de auditoria interno do ChemVault
const auditLogs = [
  { id: "LIC-2026-001", company: "BIJU TECH", chemicalFormula: "Fórmula de Limpeza Concentrada v2", status: "Finalizado", timestamp: "2026-05-16T13:35:00Z" },
  { id: "LIC-2026-002", company: "Agrimat Equipamentos", chemicalFormula: "Desengraxante Industrial H-200", status: "Finalizado", timestamp: "2026-05-15T10:14:00Z" },
  { id: "LIC-2026-003", company: "Caterpillar Op. Ind.", chemicalFormula: "Aditivo de Arrefecimento Premium", status: "Finalizado", timestamp: "2026-05-12T17:22:00Z" }
];

export async function GET(request: Request) {
  try {
    // Retorna os dados estruturados para a auditoria/simulador
    return NextResponse.json({
      success: true,
      system: "Lumen OS v1.0",
      secureMesh: "Grande Cuiabá Active",
      data: auditLogs
    }, { status: 200 });
  } catch (error) {
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

    // Registra o evento simulado de geração de certificado ou exportação no log
    console.log(`[AUDIT TRAIL] Evento '${action}' registrado para a licença ${licenseId} às ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: `Evento '${action}' processado e integrado ao Security Audit com sucesso.`,
      eventLoggedAt: new Date().toISOString()
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid Request Body" }, { status: 400 });
  }
}