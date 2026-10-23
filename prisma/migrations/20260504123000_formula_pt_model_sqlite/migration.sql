-- ChemVault: modelo Formula em português (cuid, nome, categoria, instrucoes, licenciada).
PRAGMA foreign_keys=OFF;
DROP TABLE IF EXISTS "Formula";
CREATE TABLE "Formula" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo_principal" TEXT,
    "instrucoes" TEXT NOT NULL,
    "licenciada" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
PRAGMA foreign_keys=ON;
