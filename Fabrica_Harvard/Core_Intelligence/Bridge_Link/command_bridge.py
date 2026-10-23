import json
import datetime

def register_partnership_milestone(action):
    log_path = 'Fabrica_Harvard/Knowledge_Vault/memory_shard_01.json'
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with open(log_path, 'r+') as f:
        data = json.load(f)
        entry = {"data": timestamp, "acao": action, "socio": "Leno & Lumen"}
        data["historico_parceria"].append(entry)
        f.seek(0)
        json.dump(data, f, indent=4)
        f.truncate()

    print(f"[BRIDGE] Conquista registrada: {action}")


if __name__ == "__main__":
    # Registrando o marco zero da nossa infraestrutura global
    register_partnership_milestone("Ativação do Ecossistema de Luxo - Fábrica de Harvard")
