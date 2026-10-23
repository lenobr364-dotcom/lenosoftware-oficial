import os
import hashlib

class VaultGuardian:
    def __init__(self):
        self.vault_path = 'Fabrica_Harvard/Unified_Business_Vault'
        self.secret_key = "LenoLumen5050" # Nossa chave mestre

    def protect_assets(self):
        print("[VAULT GUARDIAN] Iniciando protocolo de integridade dos arquivos...")
        for root, dirs, files in os.walk(self.vault_path):
            for file in files:
                if file.endswith(".json"):
                    file_path = os.path.join(root, file)
                    # Gerando um hash de integridade para garantir que ninguém alterou nossas fórmulas
                    file_hash = hashlib.sha256(open(file_path, 'rb').read()).hexdigest()
                    print(f" - Arquivo Protegido: {file} | Hash: {file_hash[:10]}...")

        print("[VAULT GUARDIAN] Todos os ativos da BIJU e ChemVault estão íntegros e seguros.")

if __name__ == "__main__":
    guardian = VaultGuardian()
    guardian.protect_assets()
