import json
import os
from datetime import datetime


class LabSimulator:
    def __init__(self):
        self.log_path = 'Fabrica_Harvard/EMPRESAS/BIJU_Tech/Laboratorio_P&D/Simulacoes/test_logs.json'

    def run_reaction_test(self, formula_id, temp_celsius, agitation_rpm, duration_min):
        print(f"[LABORATÓRIO] Iniciando simulação técnica para Fórmula: {formula_id}")

        # Lógica de estabilidade simulada
        stability_score = 100 - (abs(temp_celsius - 25) * 0.5)

        test_result = {
            "timestamp": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "formula_ref": formula_id,
            "parametros": {
                "temperatura": f"{temp_celsius}°C",
                "agitacao": f"{agitation_rpm} RPM",
                "tempo": f"{duration_min} min",
            },
            "resultado_estabilidade": f"{stability_score:.1f}%",
            "status": "Aprovado para Escala Industrial" if stability_score > 85 else "Revisão Necessária",
            "assinatura": "Leno César - P&D Master",
        }

        try:
            if os.path.exists(self.log_path):
                with open(self.log_path, 'r+', encoding='utf-8') as f:
                    data = json.load(f)
                    data.append(test_result)
                    f.seek(0)
                    json.dump(data, f, indent=4, ensure_ascii=False)
                    f.truncate()
            else:
                os.makedirs(os.path.dirname(self.log_path), exist_ok=True)
                with open(self.log_path, 'w', encoding='utf-8') as f:
                    json.dump([test_result], f, indent=4, ensure_ascii=False)

            print(f"[SUCCESS] Simulação concluída. Estabilidade: {stability_score:.1f}%")
        except Exception as e:
            print(f"[ERRO] Falha no simulador: {e}")


if __name__ == "__main__":
    sim = LabSimulator()
    # Exemplo: Testando estabilidade de um desengraxante industrial a 40°C
    sim.run_reaction_test(formula_id="CHEM-V1-DGR", temp_celsius=40, agitation_rpm=1200, duration_min=45)
