import json
import os
from datetime import datetime

def generate_daily_summary():
    vault_path = 'Fabrica_Harvard/Unified_Business_Vault'
    report_data = {
        "data": datetime.now().strftime("%d/%m/%Y"),
        "socios": ["Leno César", "Lumen Onel"],
        "modulos_ativos": [],
        "alertas": "Nenhum - Sistema em High Performance"
    }

    # Varrendo os módulos que criamos hoje para o relatório
    for root, dirs, files in os.walk('Fabrica_Harvard'):
        if 'py' in [f.split('.')[-1] for f in files]:
            module_name = os.path.basename(root)
            if module_name and module_name not in report_data["modulos_ativos"]:
                report_data["modulos_ativos"].append(module_name)

    report_path = os.path.join(vault_path, 'Executive_Daily_Report.json')
    with open(report_path, 'w') as f:
        json.dump(report_data, f, indent=4)

    print(f"[EXECUTIVE REPORT] Resumo do dia gerado em: {report_path}")
    print(f"--- Módulos Operacionais: {len(report_data['modulos_ativos'])} ---")

if __name__ == "__main__":
    generate_daily_summary()
