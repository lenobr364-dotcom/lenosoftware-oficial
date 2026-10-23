import json
import os
from datetime import datetime

class ChemicalStock:
    def __init__(self):
        self.stock_path = 'Fabrica_Harvard/Unified_Business_Vault/chemical_inventory.json'

    def update_stock(self, substance_name, quantity, unit, min_threshold):
        print(f"[STOCK] Atualizando níveis de: {substance_name}")

        status = "ESTÁVEL" if quantity > min_threshold else "ALERTA: REPOSIÇÃO NECESSÁRIA"

        entry = {
            "insumo": substance_name,
            "quantidade_atual": quantity,
            "unidade": unit,
            "limite_minimo": min_threshold,
            "status_estoque": status,
            "ultima_conferencia": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "responsavel_tecnico": "Leno César - Técnico em Química"
        }

        try:
            if os.path.exists(self.stock_path):
                with open(self.stock_path, 'r+') as f:
                    data = json.load(f)
                    # Atualiza se já existir ou adiciona novo
                    updated = False
                    for item in data:
                        if item['insumo'] == substance_name:
                            item.update(entry)
                            updated = True
                            break
                    if not updated:
                        data.append(entry)
                    f.seek(0)
                    json.dump(data, f, indent=4)
                    f.truncate()
            else:
                with open(self.stock_path, 'w') as f:
                    json.dump([entry], f, indent=4)

            print(f"[SUCCESS] Inventário de '{substance_name}' atualizado. Status: {status}")
        except Exception as e:
            print(f"[ERRO] Falha no controle de estoque: {e}")

if __name__ == "__main__":
    stock = ChemicalStock()
    # Exemplo: Controle de Tensoativo para a BIJU
    stock.update_stock(
        substance_name="Tensoativo Aniônico Premium",
        quantity=50.0,
        unit="Litros",
        min_threshold=100.0
    )
