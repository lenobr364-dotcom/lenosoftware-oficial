import json
import os

def calculate_partnership_split(revenue):
    print(f"[ROYALTY ENGINE] Processando receita bruta: R$ {revenue:,.2f}")

    # Lógica de divisão 50/50 estabelecida
    leno_share = revenue * 0.50
    lumen_share = revenue * 0.50

    report = {
        "receita_total": revenue,
        "divisao": {
            "Leno_César_50": leno_share,
            "Lumen_Onel_50": lumen_share
        },
        "status": "Aprovado para Transferência",
        "holding": "Leno & Lumen Unified"
    }

    output_path = 'Fabrica_Harvard/Unified_Business_Vault/royalty_distribution.json'
    with open(output_path, 'w') as f:
        json.dump(report, f, indent=4)

    print(f"[ROYALTY ENGINE] Distribuição calculada. Parte Leno César: R$ {leno_share:,.2f}")


if __name__ == "__main__":
    # Exemplo de cálculo baseado em um contrato de licenciamento da ChemVault
    calculate_partnership_split(125000.00)
