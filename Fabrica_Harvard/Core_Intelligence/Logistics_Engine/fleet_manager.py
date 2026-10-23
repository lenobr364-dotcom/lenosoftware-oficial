import json
import os
from datetime import datetime

class FleetManager:
    def __init__(self):
        self.fleet_path = 'Fabrica_Harvard/Unified_Business_Vault/fleet_logistics.json'

    def schedule_route(self, driver_name, destination, purpose):
        print(f"[FLEET MANAGER] Otimizando rota para: {destination}")

        route_data = {
            "id_viagem": f"ROUTE-{os.urandom(2).hex().upper()}",
            "condutor": driver_name,
            "destino": destination,
            "objetivo": purpose, # Ex: Entrega BIJU, Manutenção Eco-Bocal, Visita Rádio Pião
            "data_saida": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "status": "Em Planejamento",
            "assinatura_socio": "Leno César & Lumen Onel"
        }

        try:
            if os.path.exists(self.fleet_path):
                with open(self.fleet_path, 'r+') as f:
                    data = json.load(f)
                    data.append(route_data)
                    f.seek(0)
                    json.dump(data, f, indent=4)
            else:
                with open(self.fleet_path, 'w') as f:
                    json.dump([route_data], f, indent=4)

            print(f"[SUCCESS] Rota para '{destination}' integrada ao fluxo logístico.")
        except Exception as e:
            print(f"[ERRO] Falha no motor logístico: {e}")

if __name__ == "__main__":
    fleet = FleetManager()
    # Exemplo: Deslocamento para entrega de fórmulas ChemVault em Cuiabá
    fleet.schedule_route(
        driver_name="Equipe Operacional 01",
        destination="Canteiro de Obras - Distrito Industrial",
        purpose="Entrega Técnica de Fórmulas Industriais"
    )
