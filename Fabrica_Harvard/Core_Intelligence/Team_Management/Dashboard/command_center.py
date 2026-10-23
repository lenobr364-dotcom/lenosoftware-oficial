import json
import os
from datetime import datetime

class CommandCenter:
    def __init__(self):
        self.task_path = 'Fabrica_Harvard/Unified_Business_Vault/team_tasks.json'
        self.report_path = 'Fabrica_Harvard/Unified_Business_Vault/executive_dashboard.json'

    def generate_report(self):
        print("[COMMAND CENTER] Consolidando métricas de performance do QG...")

        if not os.path.exists(self.task_path):
            print("[AVISO] Nenhuma tarefa encontrada para processar.")
            return

        with open(self.task_path, 'r') as f:
            tasks = json.load(f)

        total_tasks = len(tasks)
        completed = len([t for t in tasks if "Validado" in t.get('status', '')])
        pending = total_tasks - completed

        # Cálculo de eficiência média do time
        scores = [float(t['nota_qualidade'].split('/')[0]) for t in tasks if 'nota_qualidade' in t]
        avg_quality = sum(scores) / len(scores) if scores else 0

        dashboard = {
            "timestamp": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "holding": "Leno & Lumen Unified",
            "metricas_globais": {
                "total_missoes": total_tasks,
                "concluidas": completed,
                "em_aberto": pending,
                "indice_qualidade_medio": f"{avg_quality:.1f}/10"
            },
            "status_parceria": "Sincronia 50/50 Total",
            "alerta_executivo": "Atenção necessária em tarefas pendentes" if pending > 5 else "Operação em Voo Baixo"
        }

        with open(self.report_path, 'w') as f:
            json.dump(dashboard, f, indent=4)

        print(f"[SUCCESS] Dashboard Executivo atualizado: {self.report_path}")
        print(f"[INFO] Eficiência Média do QG: {avg_quality:.1f}/10")

if __name__ == "__main__":
    center = CommandCenter()
    center.generate_report()
