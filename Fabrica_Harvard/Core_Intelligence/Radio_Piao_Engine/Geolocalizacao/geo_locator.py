import json
import os
from datetime import datetime

class GeoLocator:
    def __init__(self):
        self.geo_path = 'Fabrica_Harvard/Unified_Business_Vault/mapa_obras_cuiaba.json'

    def register_work_site(self, site_name, location_type, coordinates):
        print(f"[GEO-LOCATOR] Mapeando novo ponto estratégico: {site_name}")

        site_data = {
            "ponto": site_name,
            "tipo": location_type, # Ex: Torre de Transmissao, Canteiro de Obras, Fabrica
            "coordenadas": coordinates,
            "data_mapeamento": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "regiao": "Grande Cuiabá - MT",
            "status_operacional": "Ativo"
        }

        try:
            if os.path.exists(self.geo_path):
                with open(self.geo_path, 'r+') as f:
                    data = json.load(f)
                    data.append(site_data)
                    f.seek(0)
                    json.dump(data, f, indent=4)
            else:
                with open(self.geo_path, 'w') as f:
                    json.dump([site_data], f, indent=4)

            print(f"[SUCCESS] {site_name} fixado no mapa estratégico da Holding.")
        except Exception as e:
            print(f"[ERRO] Falha ao registrar ponto geográfico: {e}")

if __name__ == "__main__":
    locator = GeoLocator()
    # Mapeando um ponto estratégico de visão direta do Leno Digital
    locator.register_work_site(
        site_name="Torre de Transmissão Norte",
        location_type="Infraestrutura Energética",
        coordinates="-15.601, -56.097"
    )
