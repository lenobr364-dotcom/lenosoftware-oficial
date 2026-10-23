import { applyInternationalLicensingMask, hasValidInternationalTermsAcceptance } from "@/lib/licensing-guard";
import { decryptFormulaRow } from "@/lib/formula-field-crypto";
import { parseFormulaInstrucoesBlocks } from "@/lib/formula-instrucoes-blocks";
import { parseProductLine } from "@/lib/product-line";
import { verifyVaultGateToken, VAULT_GATE_COOKIE } from "@/lib/vault-session";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(VAULT_GATE_COOKIE)?.value;
  if (!verifyVaultGateToken(token)) {
    return NextResponse.json({ error: "vault_locked" }, { status: 401 });
  }

  try {
    const rows = await prisma.formula.findMany({
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        categoria: true,
        instrucoes: true,
      },
    });
    const mapped = rows.map((row) => {
      const r = decryptFormulaRow(row);
      const b = parseFormulaInstrucoesBlocks(r.instrucoes);
      return {
        id: r.id,
        title: r.nome,
        productLine: parseProductLine(r.categoria, r.nome),
        rawMaterials: b.RAW ?? "",
        preparationMethod: b.PREP ?? "",
      };
    });
    const hasIntl = await hasValidInternationalTermsAcceptance();
    const masked = applyInternationalLicensingMask(mapped, hasIntl);
    return NextResponse.json({ formulas: masked });
  } catch {
    return NextResponse.json({ formulas: [] });
  }
}