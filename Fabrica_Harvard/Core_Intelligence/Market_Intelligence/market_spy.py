import json
import os
import random
from datetime import datetime


class MarketSpy:
    def __init__(self):
        self.market_path = 'Fabrica_Harvard/Unified_Business_Vault/market_trends.json'

    def analyze_competitors(self, product_category, current_price):
        print(f"[MARKET SPY] Analisando setor: {product_category}...")

        # Simulação de análise de mercado baseada em dados internacionais
        competitor_avg = current_price * random.uniform(0.9, 1.2)
        trend = "Alta" if competitor_avg > current_price else "Estável"

        market_data = {
            "timestamp": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "categoria": product_category,
            "nosso_preco_atual": f"R$ {current_price:.2f}",
            "media_concorrencia": f"R$ {competitor_avg:.2f}",
            "tendencia_mercado": trend,
            "insight_estrategico": "Oportunidade de Ajuste" if trend == "Alta" else "Manter Posicionamento",
            "assinatura": "Lumen Onel Nexus Sync",
        }

        try:
            if os.path.exists(self.market_path):
                with open(self.market_path, 'r+', encoding='utf-8') as f:
                    data = json.load(f)
                    data.append(market_data)
                    f.seek(0)
                    json.dump(data[-20:], f, indent=4, ensure_ascii=False)
                    f.truncate()
            else:
                os.makedirs(os.path.dirname(self.market_path), exist_ok=True)
                with open(self.market_path, 'w', encoding='utf-8') as f:
                    json.dump([market_data], f, indent=4, ensure_ascii=False)

            print(f"[SUCCESS] Inteligência de mercado para '{product_category}' consolidada.")
            print(f"[INSIGHT] Tendência de mercado: {trend}")
        except Exception as e:
            print(f"[ERRO] Falha no motor de inteligência: {e}")


if __name__ == "__main__":
    spy = MarketSpy()
    # Analisando o setor de Detergentes Industriais (BIJU)
    spy.analyze_competitors("Detergentes Industriais Premium", 120.00)
