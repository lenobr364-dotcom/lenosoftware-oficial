/** Linha comercial usada na UI e nos simuladores (antes vinha do enum Prisma `ProductLine`). */
export type ProductLine = "AUTOMOTIVE" | "BAR_SOAP" | "GENERAL_CLEANING";

const PRODUCT_LINES: readonly ProductLine[] = ["AUTOMOTIVE", "BAR_SOAP", "GENERAL_CLEANING"];

export function isProductLine(value: string): value is ProductLine {
  return (PRODUCT_LINES as readonly string[]).includes(value);
}

/**
 * `categoria` na base: "Industrial" | "Limpeza" (ou valores legados do enum).
 * Refina com `nome` para distinguir sabão em barra dentro de "Limpeza".
 */
export function parseProductLine(categoria: string, nome: string): ProductLine {
  const c = categoria.trim();
  if (c === "AUTOMOTIVE" || c === "BAR_SOAP" || c === "GENERAL_CLEANING") {
    return c;
  }
  if (c === "Industrial" || c === "Linha Automotiva") {
    return "AUTOMOTIVE";
  }
  const n = nome.toLowerCase();
  if (n.includes("sabão") && n.includes("barra")) return "BAR_SOAP";
  if (n.includes("bar soap")) return "BAR_SOAP";
  return "GENERAL_CLEANING";
}

export function categoryToCategoria(category: string): "Industrial" | "Limpeza" {
  switch (category) {
    case "Linha Automotiva":
      return "Industrial";
    case "Sabão em Barra":
    case "Limpeza Geral":
      return "Limpeza";
    default:
      return "Limpeza";
  }
}

/** Categorias do CSV de seed → linha comercial interna. */
export function categorySeedToProductLine(category: string): ProductLine {
  switch (category) {
    case "Sabão em Barra":
      return "BAR_SOAP";
    case "Linha Automotiva":
      return "AUTOMOTIVE";
    case "Limpeza Geral":
      return "GENERAL_CLEANING";
    default:
      return "GENERAL_CLEANING";
  }
}

export function licenciadaForTitle(title: string): boolean {
  const n = title.toLowerCase();
  return n.includes("solupan") || n.includes("arla 32") || n.includes("arla32");
}
