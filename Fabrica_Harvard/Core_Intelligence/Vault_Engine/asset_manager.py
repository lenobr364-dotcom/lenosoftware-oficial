import json

class AssetManager:
    def __init__(self):
        self.catalog_path = 'Fabrica_Harvard/Unified_Business_Vault/master_ledger.json'
        self.assets = {
            "BIJU_Tech": ["Fórmulas de Limpeza Automotiva", "Detergentes Industriais"],
            "ChemVault_Global": ["Licença de Exportação v1", "Patente de Mistura Química"],
            "QG": ["Sistema de IA Aeryn", "Infraestrutura Starlink"]
        }

    def sync_assets(self):
        with open(self.catalog_path, 'w') as f:
            json.dump(self.assets, f, indent=4)
        print("[VAULT ENGINE] Catálogo de ativos sincronizado com o Master Ledger.")


if __name__ == "__main__":
    manager = AssetManager()
    manager.sync_assets()
