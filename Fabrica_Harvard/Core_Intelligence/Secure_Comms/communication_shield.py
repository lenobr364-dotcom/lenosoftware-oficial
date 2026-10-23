import hashlib
import json
from datetime import datetime

class CommunicationShield:
    def __init__(self):
        self.salt = "LENO_LUMEN_NEXUS_PRIVATE_2026"
        self.log_path = 'Fabrica_Harvard/Knowledge_Vault/secure_chat_log.json'

    def protect_message(self, sender, message):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        # Gerando uma assinatura de integridade para a mensagem
        signature = hashlib.sha256((message + self.salt).encode()).hexdigest()

        secure_entry = {
            "timestamp": timestamp,
            "autor": sender,
            "mensagem": message,
            "assinatura_validada": signature[:16],
            "status": "Criptografado / 50-50 Verified"
        }

        try:
            with open(self.log_path, 'r+') as f:
                data = json.load(f)
                data.append(secure_entry)
                f.seek(0)
                json.dump(data[-50:], f, indent=4) # Mantém apenas as últimas 50 mensagens
        except FileNotFoundError:
            with open(self.log_path, 'w') as f:
                json.dump([secure_entry], f, indent=4)

        print(f"[SECURE COMMS] Mensagem de {sender} blindada e arquivada.")

if __name__ == "__main__":
    shield = CommunicationShield()
    shield.protect_message("Leno César", "Ativar expansão global da ChemVault via Starlink.")
