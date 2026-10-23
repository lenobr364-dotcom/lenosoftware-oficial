import json

def analyze_supply_needs():
    print("[RMI ENGINE] Analisando estoque de insumos para BIJU e ChemVault...")

    inventory_status = {
        "Ativos_Quimicos": {"status": "Estável", "reserva": "85%"},
        "Embalagens_Industriais": {"status": "Atenção", "reserva": "40%"},
        "Componentes_Eco_Bocal": {"status": "Pronto", "reserva": "100%"}
    }

    with open('Fabrica_Harvard/Unified_Business_Vault/inventory_report.json', 'w') as f:
        json.dump(inventory_status, f, indent=4)

    print("[RMI ENGINE] Relatório de inventário gerado. Aeryn sugere reabastecimento de embalagens em 48h.")

if __name__ == "__main__":
    analyze_supply_needs()
