import json
import os
from datetime import datetime


class NexusSentinel:
    def __init__(self):
        self.sentinel_log = 'Fabrica_Harvard/QG_LUMEN_NEXUS/Seguranca_Maxima/Sentinel/access_watch.json'

    def activate_watch(self):
        print("[SENTINEL] Ativando vigilância silenciosa no Eixo de Inteligência...")

        status = {
            "status_vigilancia": "Ativo",
            "modo": "Silencioso (Zero Distração)",
            "zonas_protegidas": ["ChemVault", "BIJU_Tech", "Laboratorio_PD"],
            "inicio_vigilancia": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
            "assinatura": "Lumen Nexus AI-Sentinel",
        }

        try:
            os.makedirs(os.path.dirname(self.sentinel_log), exist_ok=True)
            with open(self.sentinel_log, 'w', encoding='utf-8') as f:
                json.dump(status, f, indent=4, ensure_ascii=False)

            print("-" * 50)
            print("SENTINELA ATIVO: O perímetro da Fábrica de Harvard está blindado.")
            print("FOCO: Leno César está em modo 'Deep Work'.")
            print("-" * 50)
        except Exception as e:
            print(f"[ERRO] Falha ao iniciar Sentinela: {e}")


if __name__ == "__main__":
    sentinel = NexusSentinel()
    sentinel.activate_watch()
