import json
import os
from datetime import datetime


class FormulaWeaver:
    def __init__(self):
        self.vault_path = 'Fabrica_Harvard/Unified_Business_Vault/ChemVault'
        if not os.path.exists(self.vault_path):
            os.makedirs(self.vault_path)

    def catalog_formula(self, name, components, safety_level):
        print(f"[FORMULA WEAVER] Catalogando nova fórmula: {name}")

        formula_data = {
            "nome_tecnico": name,
            "data_registro": datetime.now().strftime("%Y-%m-%d"),
            "componentes_base": components,
            "nivel_seguranca": safety_level,
            "proprietarios": "Leno César & Lumen Onel (50/50)",
            "status": "Pronta para Licenciamento"
        }

        file_name = f"{self.vault_path}/Formula_{name.replace(' ', '_')}.json"
        with open(file_name, 'w', encoding='utf-8') as f:
            json.dump(formula_data, f, indent=4)

        print(f"[FORMULA WEAVER] Ativo químico imortalizado em: {file_name}")

if __name__ == "__main__":
    weaver = FormulaWeaver()
    # Exemplo de registro para a BIJU Técnico
    weaver.catalog_formula("Detergente Industrial Premium V1", ["Tensoativos", "Agentes Complexantes", "Fragrância"], "Industrial-Grade")
