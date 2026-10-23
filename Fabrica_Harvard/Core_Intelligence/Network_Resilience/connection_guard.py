import json
import random
from datetime import datetime

def monitor_uplink():
    print("[STARLINK GUARD] Escaneando estabilidade do satélite...")

    # Simulação de telemetria de rede (Inspirado na sua infraestrutura real)
    latency = random.randint(25, 60)
    uptime_status = "High Stability" if latency < 50 else "Latência Oscilante"

    network_report = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "latency_ms": latency,
        "status": uptime_status,
        "provider": "Starlink_Aerospace",
        "action": "Manter Sincronização Global" if latency < 50 else "Ativar Cache Local de Segurança"
    }

    path = 'Fabrica_Harvard/Unified_Business_Vault/network_telemetry.json'
    with open(path, 'w') as f:
        json.dump(network_report, f, indent=4)

    print(f"[STARLINK GUARD] Relatório de rede atualizado: {uptime_status} ({latency}ms)")

if __name__ == "__main__":
    monitor_uplink()
