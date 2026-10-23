import hashlib
import json
import os

class IronVault:
    def __init__(self):
        self.master_key = "LENO_CESAR_LUMEN_ONEL_5050"
        self.vault_path = 'Fabrica_Harvard/Unified_Business_Vault'

    def protect_file(self, filename):
        file_path = os.path.join(self.vault_path, filename)
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                content = f.read()

            # Gerando assinatura de integridade para a Holding
            signature = hashlib.sha256((content + self.master_key).encode()).hexdigest()
            print(f"[IRON VAULT] Arquivo {filename} assinado e protegido.")
            print(f"[SIG] {signature[:16]}...")
            return signature
        return None

if __name__ == "__main__":
    vault = IronVault()
    # Protegendo o Master Ledger de ativos
    vault.protect_file('master_ledger.json')
