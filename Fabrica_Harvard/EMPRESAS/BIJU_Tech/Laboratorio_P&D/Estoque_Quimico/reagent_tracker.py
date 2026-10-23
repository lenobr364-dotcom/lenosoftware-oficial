import json
import os
from datetime import datetime


class ReagentTracker:
    def __init__(self):
        self.stock_path = 'Fabrica_Harvard/EMPRESAS/BIJU_Tech/Laboratorio_P&D/Estoque_Quimico/reagents.json'

    def update_reagent(self, name, quantity, unit, expiry_date):
        print(f"[LAB] Monitorando insumo de laboratório: {name}")

        entry = {
            "reagente_id": f"RGT-{os.urandom(2).hex().upper()}",
            "nome": name,
            "quantidade": quantity,
            "unidade": unit,
            "validade": expiry_date,
            "data_conferencia": datetime.now().strftime("%d/%m/%Y"),
            "status_insumo": "ESTÁVEL" if quantity > 10 else "ALERTA: REPOSIÇÃO IMEDIATA",
            "assinatura_tecnica": "Leno César - P&D",
        }

        try:
            if os.path.exists(self.stock_path):
                with open(self.stock_path, 'r+', encoding='utf-8') as f:
                    data = json.load(f)
                    data.append(entry)
                    f.seek(0)
                    json.dump(data, f, indent=4, ensure_ascii=False)
                    f.truncate()
            else:
                os.makedirs(os.path.dirname(self.stock_path), exist_ok=True)
                with open(self.stock_path, 'w', encoding='utf-8') as f:
                    json.dump([entry], f, indent=4, ensure_ascii=False)

            print(f"[SUCCESS] Reagente '{name}' atualizado no inventário do laboratório.")
        except Exception as e:
            print(f"[ERRO] Falha ao rastrear reagente: {e}")


if __name__ == "__main__":
    tracker = ReagentTracker()
    # Exemplo: Monitorando o estoque de Tensoativo para testes na BIJU Tech
    tracker.update_reagent(
        name="Solvente Industrial Alfa",
        quantity=5.5,
        unit="Litros",
        expiry_date="20/12/2026",
    )
