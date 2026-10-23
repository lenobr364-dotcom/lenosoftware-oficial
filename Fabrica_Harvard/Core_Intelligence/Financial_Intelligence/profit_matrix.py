import json
import os
from datetime import datetime


class ProfitMatrix:
    def __init__(self):
        self.stock_path = 'Fabrica_Harvard/Unified_Business_Vault/chemical_inventory.json'
        self.price_path = 'Fabrica_Harvard/Unified_Business_Vault/pricing_strategy.json'

    def calculate_ideal_price(self, product_name, base_formula_costs, target_margin=0.60):
        print(f"[PROFIT MATRIX] Analisando viabilidade comercial: {product_name}")

        # Cálculo: Preço = Custo / (1 - Margem)
        suggested_price = base_formula_costs / (1 - target_margin)
        lucro_bruto = suggested_price - base_formula_costs

        pricing_data = {
            "produto": product_name,
            "custo_base_insumos": round(base_formula_costs, 2),
            "margem_alvo": f"{target_margin * 100}%",
            "preco_sugerido_venda": round(suggested_price, 2),
            "lucro_estimado_unidade": round(lucro_bruto, 2),
            "divisao_socios_50_50": round(lucro_bruto / 2, 2),
            "data_analise": datetime.now().strftime("%d/%m/%Y %H:%M")
        }

        try:
            if os.path.exists(self.price_path):
                with open(self.price_path, 'r+') as f:
                    data = json.load(f)
                    data.append(pricing_data)
                    f.seek(0)
                    json.dump(data, f, indent=4)
                    f.truncate()
            else:
                with open(self.price_path, 'w') as f:
                    json.dump([pricing_data], f, indent=4)

            print(f"[SUCCESS] Matriz atualizada para: {product_name}")
        except Exception as e:
            print(f"[ERRO] Falha na precificação: {e}")


if __name__ == "__main__":
    matrix = ProfitMatrix()
    matrix.calculate_ideal_price("Detergente Industrial Premium V1", 35.00)
