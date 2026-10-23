-- Índices para ordenação e filtros do catálogo de fórmulas (SQLite / produção).
CREATE INDEX IF NOT EXISTS "Formula_nome_idx" ON "Formula"("nome");
CREATE INDEX IF NOT EXISTS "Formula_categoria_idx" ON "Formula"("categoria");
CREATE INDEX IF NOT EXISTS "Formula_licenciada_nome_idx" ON "Formula"("licenciada", "nome");
