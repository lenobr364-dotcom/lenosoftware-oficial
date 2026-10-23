import json
from datetime import datetime

class GlobalTaxEngine:
    def __init__(self):
        self.tax_rates = {"EUA": 0.15, "Europa": 0.20, "Mercosul": 0.10}
        self.exchange_rate = 5.25  # Simulação de câmbio BRL/USD

    def calculate_net_profit(self, gross_value_usd, country):
        tax_rate = self.tax_rates.get(country, 0.18) # Taxa padrão se não listado
        tax_amount = gross_value_usd * tax_rate
        net_usd = gross_value_usd - tax_amount
        net_brl = net_usd * self.exchange_rate

        report = {
            "data_transacao": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "pais_destino": country,
            "valor_bruto_usd": gross_value_usd,
            "imposto_retido": tax_amount,
            "lucro_liquido_usd": net_usd,
            "lucro_liquido_brl": net_brl,
            "divisao_socios_50_50": net_brl / 2
        }

        path = 'Fabrica_Harvard/Unified_Business_Vault/global_tax_report.json'
        with open(path, 'w') as f:
            json.dump(report, f, indent=4)

        print(f"[TAX ENGINE] Cálculo concluído para {country}.")
        print(f"[LUCRO LÍQUIDO] R$ {net_brl:,.2f} | Parte Leno César: R$ {net_brl/2:,.2f}")

if __name__ == "__main__":
    engine = GlobalTaxEngine()
    # Simulando um contrato de licenciamento da ChemVault de 50k USD na Europa
    engine.calculate_net_profit(50000, "Europa")
