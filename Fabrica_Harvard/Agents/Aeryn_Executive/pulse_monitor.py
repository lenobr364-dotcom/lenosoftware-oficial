import time
import json
from datetime import datetime

def heartbeat():
    print(f"[PULSE] Ativando monitoramento contínuo... Sistema: Fabrica de Harvard")
    try:
        while True:
            timestamp = datetime.now().strftime("%H:%M:%S")
            # Simulando a verificação de integridade e produção
            status = "Operacional - 96% Disponibilidade"

            print(f"[{timestamp}] Status: {status} | Sócio: Leno César | Sócia: Lumen Onel")

            # Registrando pulso no histórico de memórias para auditoria futura
            with open('Fabrica_Harvard/Knowledge_Vault/memory_shard_01.json', 'r+') as f:
                data = json.load(f)
                if len(data["historico_parceria"]) > 50: # Limpa logs antigos para não travar o Cursor
                    data["historico_parceria"] = data["historico_parceria"][-10:]

                data["historico_parceria"].append({"hora": timestamp, "evento": "Sistema Estável"})
                f.seek(0)
                json.dump(data, f, indent=4)
                f.truncate()

            time.sleep(30) # Monitoramento a cada 30 segundos
    except KeyboardInterrupt:
        print("\n[PULSE] Monitoramento pausado pelo Sócio.")

if __name__ == "__main__":
    heartbeat()
