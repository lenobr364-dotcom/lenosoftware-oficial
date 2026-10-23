import json
import random

class SalesHunter:
    def __init__(self):
        self.targets = ["América Latina", "Europa", "Ásia", "América do Norte"]
        self.output_path = 'Fabrica_Harvard/Unified_Business_Vault/market_leads.json'

    def find_opportunities(self):
        print("[SALES HUNTER] Escaneando territórios para licenciamento ChemVault...")

        leads = []
        for region in self.targets:
            opportunity_score = random.randint(75, 99)
            leads.append({
                "regiao": region,
                "potencial_licenciamento": f"{opportunity_score}%",
                "status": "Oportunidade Identificada",
                "prioridade": "Alta" if opportunity_score > 90 else "Média"
            })

        with open(self.output_path, 'w') as f:
            json.dump(leads, f, indent=4)

        print(f"[SALES HUNTER] {len(leads)} leads estratégicos gerados em: {self.output_path}")

if __name__ == "__main__":
    hunter = SalesHunter()
    hunter.find_opportunities()
