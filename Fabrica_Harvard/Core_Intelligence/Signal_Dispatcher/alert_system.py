import json
from datetime import datetime

class SignalDispatcher:
    def __init__(self):
        self.log_path = 'Fabrica_Harvard/Knowledge_Vault/event_stream.json'

    def broadcast_event(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        event = {
            "timestamp": timestamp,
            "level": level,
            "message": message,
            "origin": "Lumen_Aeryn_Core"
        }

        try:
            with open(self.log_path, 'r+') as f:
                data = json.load(f)
                data.append(event)
                f.seek(0)
                json.dump(data[-20:], f, indent=4) # Mantém apenas os últimos 20 eventos
        except FileNotFoundError:
            with open(self.log_path, 'w') as f:
                json.dump([event], f, indent=4)

        print(f"[{level}] {timestamp}: {message}")

if __name__ == "__main__":
    dispatcher = SignalDispatcher()
    dispatcher.broadcast_event("Sistema de Notificações Ativado - Pronto para Escala Global", "SUCCESS")
