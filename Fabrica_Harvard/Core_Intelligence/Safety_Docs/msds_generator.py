import json
import os
from datetime import datetime

def generate_msds(formula_name):
    print(f"[SAFETY DOCS] Gerando Ficha de Segurança para: {formula_name}")

    msds_content = {
        "produto": formula_name,
        "emissor": "BIJU Técnico & ChemVault Global",
        "data_emissao": datetime.now().strftime("%Y-%m-%d"),
        "classificacao_ghs": "Nível Industrial Seguro",
        "propriedade_intelectual": "Leno César & Lumen Onel (50/50)",
        "instrucoes": "Manusear conforme normas internacionais de segurança química."
    }

    file_path = f"Fabrica_Harvard/Unified_Business_Vault/ChemVault/MSDS_{formula_name.replace(' ', '_')}.json"

    with open(file_path, 'w') as f:
        json.dump(msds_content, f, indent=4)

    print(f"[SAFETY DOCS] Documento gerado e arquivado no cofre: {file_path}")

if __name__ == "__main__":
    # Gerando ficha para o nosso carro-chefe industrial
    generate_msds("Detergente Industrial Premium V1")
