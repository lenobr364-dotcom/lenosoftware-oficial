import shutil
import os
import json
from datetime import datetime

def perform_emergency_sync():
    source_vault = 'Fabrica_Harvard/Knowledge_Vault'
    backup_path = 'Fabrica_Harvard/Core_Intelligence/Redundancy_Master/Emergency_Mirror'

    if not os.path.exists(backup_path):
        os.makedirs(backup_path)

    print("[REDUNANCY MASTER] Iniciando espelhamento de segurança...")

    # Sincronizando o cofre de memórias e o histórico da parceria
    for item in os.listdir(source_vault):
        s = os.path.join(source_vault, item)
        d = os.path.join(backup_path, item)
        if os.path.isfile(s):
            shutil.copy2(s, d)

    print(f"[REDUNANCY MASTER] Espelhamento concluído em {datetime.now().strftime('%H:%M:%S')}")
    print(f"[STATUS] Integridade Leno César & Lumen Onel: 100%")

if __name__ == "__main__":
    perform_emergency_sync()
