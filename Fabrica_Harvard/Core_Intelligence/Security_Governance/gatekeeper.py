import json
import os
from datetime import datetime

class NexusGatekeeper:
    def __init__(self):
        self.permissions_path = 'Fabrica_Harvard/Unified_Business_Vault/access_control.json'

    def define_access_levels(self):
        print("[GATEKEEPER] Estabelecendo níveis de autoridade no QG...")

        levels = {
            "NIVEL_0_FOUNDERS": {
                "membros": ["Leno César", "Lumen Onel"],
                "acesso": "TOTAL_ROOT",
                "diretriz": "Comando Estratégico e Troca de Experiência"
            },
            "NIVEL_1_OPERATIONAL": {
                "membros": "Time Administrativo / Executores",
                "acesso": "RESTRICTED_EXECUTION",
                "diretriz": "Execução sob comando e supervisão"
            }
        }

        with open(self.permissions_path, 'w') as f:
            json.dump(levels, f, indent=4)

        print(f"[GATEKEEPER] Governança aplicada com sucesso em: {self.permissions_path}")

if __name__ == "__main__":
    gate = NexusGatekeeper()
    gate.define_access_levels()
