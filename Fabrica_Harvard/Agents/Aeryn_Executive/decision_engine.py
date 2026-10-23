import json
import os

def analyze_and_optimize():
    telemetry_path = 'Fabrica_Harvard/Unified_Business_Vault/machine_telemetry.json'

    if os.path.exists(telemetry_path):
        with open(telemetry_path, 'r') as f:
            data = json.load(f)

        efficiency = data.get("efficiency", "Unknown")
        print(f"[AERYN DECISION] Eficiência atual: {efficiency}")

        if efficiency == "High Performance":
            print("[AERYN DECISION] Sugestão: Aumentar lote de produção da BIJU em 15% para atender demanda ChemVault.")

        # Salvando a decisão no histórico de memórias
        memory_path = 'Fabrica_Harvard/Knowledge_Vault/memory_shard_01.json'
        with open(memory_path, 'r+') as f:
            memories = json.load(f)
            memories["conquistas"].append(f"Otimização de produção sugerida por Aeryn em 2026-05-12")
            f.seek(0)
            json.dump(memories, f, indent=4)
            f.truncate()

    print("[AERYN DECISION] Decisão estratégica registrada no Cofre de Memórias.")

if __name__ == "__main__":
    analyze_and_optimize()
