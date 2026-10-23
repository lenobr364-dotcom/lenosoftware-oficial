import json
import os
from datetime import datetime


class MeritEngine:
    def __init__(self):
        self.task_path = 'Fabrica_Harvard/Unified_Business_Vault/team_tasks.json'
        self.merit_path = 'Fabrica_Harvard/Unified_Business_Vault/merit_board.json'

    def calculate_rewards(self):
        print("[MERIT SYSTEM] Analisando destaques de produtividade e qualidade...")

        if not os.path.exists(self.task_path):
            print("[AVISO] Sem dados de tarefas para processar mérito.")
            return

        with open(self.task_path, 'r') as f:
            tasks = json.load(f)

        performance_map = {}
        for task in tasks:
            if "Validado" in task.get('status', '') and 'nota_qualidade' in task:
                name = task['responsavel']
                score = float(task['nota_qualidade'].split('/')[0])

                if name not in performance_map:
                    performance_map[name] = {"total_tasks": 0, "total_score": 0}

                performance_map[name]["total_tasks"] += 1
                performance_map[name]["total_score"] += score

        ranking = []
        for name, stats in performance_map.items():
            avg = stats["total_score"] / stats["total_tasks"]
            ranking.append({
                "colaborador": name,
                "media_qualidade": f"{avg:.1f}/10",
                "missoes_cumpridas": stats["total_tasks"],
                "status_merito": "Elite" if avg >= 9 else "Standard",
            })

        ranking = sorted(
            ranking,
            key=lambda x: float(x["media_qualidade"].split("/")[0]),
            reverse=True,
        )

        merit_board = {
            "ciclo": datetime.now().strftime("%B / %Y"),
            "quadro_de_honra": ranking,
            "atualizado_em": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        with open(self.merit_path, 'w', encoding='utf-8') as f:
            json.dump(merit_board, f, indent=4)

        print(f"[MERIT SYSTEM] Quadro de honra atualizado: {self.merit_path}")


if __name__ == "__main__":
    MeritEngine().calculate_rewards()
