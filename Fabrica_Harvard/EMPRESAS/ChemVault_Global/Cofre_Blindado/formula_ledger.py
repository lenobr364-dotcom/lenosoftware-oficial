import json
import os
from datetime import datetime


class FormulaLedger:
    def __init__(self):
        self.ledger_path = 'Fabrica_Harvard/EMPRESAS/ChemVault_Global/Cofre_Blindado/vault_data.json'

    def register_formula(self, formula_name, chemical_base, license_type):
        print(f"[CHEMVAULT] Criptografando e registrando fórmula: {formula_name}")

        formula_entry = {
            "id_formula": f"CHEM-{os.urandom(3).hex().upper()}",
            "nome": formula_name,
            "base_quimica": chemical_base,
            "tipo_licenciamento": license_type,  # Ex: Global, Regional MT, Exclusiva
            "data_registro": datetime.now().strftime("%d/%m/%Y"),
            "assinatura_tecnica": "Leno César - Técnico em Química",
            "status_propriedade": "Protegida",
        }

        try:
            if os.path.exists(self.ledger_path):
                with open(self.ledger_path, 'r+', encoding='utf-8') as f:
                    data = json.load(f)
                    data.append(formula_entry)
                    f.seek(0)
                    json.dump(data, f, indent=4, ensure_ascii=False)
                    f.truncate()
            else:
                os.makedirs(os.path.dirname(self.ledger_path), exist_ok=True)
                with open(self.ledger_path, 'w', encoding='utf-8') as f:
                    json.dump([formula_entry], f, indent=4, ensure_ascii=False)

            print(f"[SUCCESS] Fórmula '{formula_name}' imortalizada no cofre da ChemVault.")
        except Exception as e:
            print(f"[ERRO] Falha na segurança do cofre: {e}")


if __name__ == "__main__":
    vault = FormulaLedger()
    # Exemplo: Registrando a fórmula base da BIJU
    vault.register_formula(
        formula_name="Detergente Premium Ativo-X",
        chemical_base="Tensoativo Aniônico + Estabilizantes",
        license_type="Licença Industrial Global",
    )
