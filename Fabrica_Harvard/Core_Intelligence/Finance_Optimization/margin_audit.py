import json
from datetime import datetime

class ProfitOptimizer:
    def __init__(self):
        self.output_path = 'Fabrica_Harvard/Unified_Business_Vault/margin_analysis.json'

    def audit_production_costs(self, formula_name, raw_cost, sale_price):
        print(f"[OPTIMIZER] Auditando margem para: {formula_name}")

        gross_margin = ((sale_price - raw_cost) / sale_price) * 100
        ideal_margin = 65.0  # Nossa meta de luxo

        analysis = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "produto": formula_name,
            "custo_insumos": raw_cost,
            "preco_venda": sale_price,
            "margem_atual": f"{gross_margin:.2f}%",
            "meta_nexus": f"{ideal_margin}%",
            "status": "Alta Performance" if gross_margin >= ideal_margin else "Ajuste Necessário",
            "divisao_estimada_50_50": (sale_price - raw_cost) / 2
        }

        with open(self.output_path, 'w') as f:
            json.dump(analysis, f, indent=4)

        print(f"[OPTIMIZER] Auditoria concluída. Margem de {gross_margin:.2f}% identificada.")

if __name__ == "__main__":
    optimizer = ProfitOptimizer()
    # Exemplo: Detergente Premium com custo de R$ 35 e venda de R$ 120
    optimizer.audit_production_costs("Detergente Industrial Premium V1", 35.00, 120.00)
