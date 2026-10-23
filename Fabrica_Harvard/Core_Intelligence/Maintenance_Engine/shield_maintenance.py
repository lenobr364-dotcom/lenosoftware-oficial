import json
import os
from datetime import datetime, timedelta

class ShieldMaintenance:
    def __init__(self):
        self.maint_path = 'Fabrica_Harvard/Unified_Business_Vault/preventive_maintenance.json'

    def schedule_maintenance(self, asset_name, last_service_date, cycle_days):
        print(f"[SHIELD] Calculando ciclo preventivo para: {asset_name}")

        last_date = datetime.strptime(last_service_date, "%d/%m/%Y")
        next_date = last_date + timedelta(days=cycle_days)

        status = "OK" if next_date > datetime.now() else "ALERTA: MANUTENÇÃO VENCIDA"

        maintenance_data = {
            "ativo": asset_name,
            "ultima_revisao": last_service_date,
            "proxima_revisao": next_date.strftime("%d/%m/%Y"),
            "ciclo_recomendado": f"{cycle_days} dias",
            "status_tecnico": status,
            "assinatura_tecnica": "Leno César - Instrutor Caterpillar"
        }

        try:
            if os.path.exists(self.maint_path):
                with open(self.maint_path, 'r+') as f:
                    data = json.load(f)
                    data.append(maintenance_data)
                    f.seek(0)
                    json.dump(data, f, indent=4)
            else:
                with open(self.maint_path, 'w') as f:
                    json.dump([maintenance_data], f, indent=4)

            print(f"[SUCCESS] Cronograma de manutenção para '{asset_name}' atualizado.")
        except Exception as e:
            print(f"[ERRO] Falha no motor de manutenção: {e}")

if __name__ == "__main__":
    shield = ShieldMaintenance()
    # Exemplo: Manutenção da Misturadora Industrial da BIJU (Ciclo de 30 dias)
    shield.schedule_maintenance(
        asset_name="Misturadora BIJU V1",
        last_service_date=datetime.now().strftime("%d/%m/%Y"),
        cycle_days=30
    )
