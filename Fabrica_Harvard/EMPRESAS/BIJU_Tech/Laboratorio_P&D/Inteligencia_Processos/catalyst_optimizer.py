import json
import os
from datetime import datetime


class NexusCatalyst:
    def __init__(self):
        self.optimization_path = (
            'Fabrica_Harvard/EMPRESAS/BIJU_Tech/Laboratorio_P&D/Inteligencia_Processos/efficiency_gains.json'
        )

    def optimize_reaction(self, formula_name, current_yield, reagent_cost):
        print(f"[CATALYST] Analisando eficiência da fórmula: {formula_name}")

        # Simulação de otimização: Aumento de rendimento e redução de custo
        optimized_yield = current_yield * 1.08  # Ganho de 8% em rendimento
        savings = reagent_cost * 0.12  # Redução de 12% em desperdício

        analysis = {
            "timestamp": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "formula": formula_name,
            "rendimento_anterior": f"{current_yield}%",
            "rendimento_otimizado": f"{optimized_yield:.1f}%",
            "economia_estimada": f"R$ {savings:.2f} por lote",
            "recomendacao": "Ajustar tempo de maturação para +15min para estabilidade total.",
            "status": "Processo Otimizado - Aguardando Implementação",
        }

        try:
            if os.path.exists(self.optimization_path):
                with open(self.optimization_path, 'r+', encoding='utf-8') as f:
                    data = json.load(f)
                    data.append(analysis)
                    f.seek(0)
                    json.dump(data, f, indent=4, ensure_ascii=False)
                    f.truncate()
            else:
                os.makedirs(os.path.dirname(self.optimization_path), exist_ok=True)
                with open(self.optimization_path, 'w', encoding='utf-8') as f:
                    json.dump([analysis], f, indent=4, ensure_ascii=False)

            print(f"[SUCCESS] Otimização concluída para '{formula_name}'. Ganhos de eficiência registrados.")
        except Exception as e:
            print(f"[ERRO] Falha na otimização do catalisador: {e}")


if __name__ == "__main__":
    catalyst = NexusCatalyst()
    catalyst.optimize_reaction(
        formula_name="Detergente Premium Ativo-X",
        current_yield=88.0,
        reagent_cost=450.00,
    )
