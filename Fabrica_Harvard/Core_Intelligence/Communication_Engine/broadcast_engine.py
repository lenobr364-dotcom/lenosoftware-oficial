import json
import os
from datetime import datetime

class BroadcastEngine:
    def __init__(self):
        self.log_path = 'Fabrica_Harvard/Unified_Business_Vault/broadcast_logs.json'

    def prepare_alert(self, channel, priority, message):
        print(f"[BROADCAST] Preparando disparo para o canal: {channel}")

        alert_package = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "canal": channel, # Ex: WhatsApp_RadioPiao, Interno_QG, ChemVault_Partners
            "prioridade": priority,
            "conteudo": message,
            "assinatura_digital": "LENO_LUMEN_AUTH_SYNC",
            "status": "Pronto para Disparo"
        }

        try:
            if os.path.exists(self.log_path):
                with open(self.log_path, 'r+') as f:
                    logs = json.load(f)
                    logs.append(alert_package)
                    f.seek(0)
                    json.dump(logs[-100:], f, indent=4) # Mantém histórico dos últimos 100 disparos
            else:
                with open(self.log_path, 'w') as f:
                    json.dump([alert_package], f, indent=4)

            print(f"[SUCCESS] Alerta de {priority} registrado e enviado para fila de processamento.")
        except Exception as e:
            print(f"[ERRO] Falha no motor de comunicação: {e}")

if __name__ == "__main__":
    engine = BroadcastEngine()
    # Exemplo de alerta para a comunidade Rádio Pião
    engine.prepare_alert(
        channel="WhatsApp_RadioPiao",
        priority="URGENTE",
        message="Nova vaga: Operador de Escavadeira em Cuiabá. Verifique o portal!"
    )
