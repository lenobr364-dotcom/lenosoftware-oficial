import json
import datetime

class GlobalBridge:
    def __init__(self):
        self.version = "1.0.0-Gold"
        self.status = "Global Ready"

    def generate_access_key(self, partner_name):
        access_data = {
            "partner": partner_name,
            "issued_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "holding": "Leno & Lumen Unified",
            "access_level": "Premium Licensing",
            "security_token": "LN-LM-GLOBAL-2026"
        }

        path = f"Fabrica_Harvard/Nexus_API/V1_Global/token_{partner_name.lower()}.json"
        with open(path, 'w') as f:
            json.dump(access_data, f, indent=4)
        print(f"[GLOBAL BRIDGE] Chave de acesso gerada para: {partner_name}")

if __name__ == "__main__":
    bridge = GlobalBridge()
    bridge.generate_access_key("International_Partner_01")
