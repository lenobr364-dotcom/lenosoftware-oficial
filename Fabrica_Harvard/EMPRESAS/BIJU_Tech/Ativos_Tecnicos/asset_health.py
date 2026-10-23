import json
import os
from datetime import datetime


class AssetHealth:
    def __init__(self):
        self.asset_path = 'Fabrica_Harvard/EMPRESAS/BIJU_Tech/Ativos_Tecnicos/inventory_health.json'

    def register_equipment(self, name, model, last_calibration, condition_score):
        print(f"[BIJU TECH] Registrando e analisando integridade do ativo: {name}")

        # Lógica de saúde: Se a nota for menor que 70, gera alerta imediato
        status = "OPERACIONAL" if condition_score >= 70 else "ALERTA: MANUTENÇÃO NECESSÁRIA"

        asset_data = {
            "ativo_id": f"EQUIP-{os.urandom(2).hex().upper()}",
            "nome": name,
            "modelo": model,
            "ultima_calibracao": last_calibration,
            "saude_tecnica": f"{condition_score}/100",
            "status": status,
            "data_registro": datetime.now().strftime("%d/%m/%Y"),
            "responsavel": "Leno César - Engenheiro Chefe",
        }

        try:
            if os.path.exists(self.asset_path):
                with open(self.asset_path, 'r+', encoding='utf-8') as f:
                    data = json.load(f)
                    data.append(asset_data)
                    f.seek(0)
                    json.dump(data, f, indent=4, ensure_ascii=False)
                    f.truncate()
            else:
                os.makedirs(os.path.dirname(self.asset_path), exist_ok=True)
                with open(self.asset_path, 'w', encoding='utf-8') as f:
                    json.dump([asset_data], f, indent=4, ensure_ascii=False)

            print(f"[SUCCESS] Ativo '{name}' integrado ao sistema de monitoramento.")
        except Exception as e:
            print(f"[ERRO] Falha ao registrar ativo: {e}")


if __name__ == "__main__":
    health = AssetHealth()
    # Exemplo: Registrando um Misturador de Alta Rotação para o Laboratório
    health.register_equipment(
        name="Misturador Homogeneizador V3",
        model="Industrial-Lab-2026",
        last_calibration="10/04/2026",
        condition_score=92,
    )
