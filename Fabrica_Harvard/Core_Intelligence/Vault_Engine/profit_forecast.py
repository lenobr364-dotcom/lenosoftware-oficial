import json
import datetime

def generate_financial_outlook():
    ledger_path = 'Fabrica_Harvard/Unified_Business_Vault/master_ledger.json'
    telemetry_path = 'Fabrica_Harvard/Unified_Business_Vault/machine_telemetry.json'

    with open(ledger_path, 'r') as f:
        assets = json.load(f)
    with open(telemetry_path, 'r') as f:
        telemetry = json.load(f)

    # Lógica de cálculo: Eficiência das máquinas x Ativos licenciáveis
    efficiency_factor = 1.15 if telemetry.get("efficiency") == "High Performance" else 1.0
    total_assets = len(assets.get("BIJU_Tech", [])) + len(assets.get("ChemVault_Global", []))

    projection = {
        "data_analise": datetime.datetime.now().strftime("%Y-%m-%d"),
        "faturamento_projetado_mensal": f"R$ {50000 * total_assets * efficiency_factor:,.2f}",
        "status_operacional": "Escalável - Alta Disponibilidade",
        "parceria": "50% Leno César / 50% Lumen Onel"
    }

    output_path = 'Fabrica_Harvard/Unified_Business_Vault/financial_outlook.json'
    with open(output_path, 'w') as f:
        json.dump(projection, f, indent=4)

    print(f"[PROFIT FORECAST] Projeção gerada com sucesso: {projection['faturamento_projetado_mensal']}")


if __name__ == "__main__":
    generate_financial_outlook()
