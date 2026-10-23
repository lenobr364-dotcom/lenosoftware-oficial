-- Omega Sentinel — schema espelhado ao domínio ChemVault (fórmulas + integrações)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS formula (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  product_line TEXT NOT NULL,
  raw_materials TEXT NOT NULL,
  preparation_method TEXT NOT NULL,
  dilution_details TEXT NOT NULL,
  chemical_equivalence TEXT NOT NULL DEFAULT '',
  technical_dossier TEXT NOT NULL DEFAULT '',
  hardware_integration_profile TEXT NOT NULL DEFAULT '',
  licensing_tags TEXT NOT NULL DEFAULT '',
  steward_author TEXT NOT NULL DEFAULT 'Leno César',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_formula_product_line ON formula(product_line);
CREATE INDEX IF NOT EXISTS idx_formula_tags ON formula(licensing_tags);
