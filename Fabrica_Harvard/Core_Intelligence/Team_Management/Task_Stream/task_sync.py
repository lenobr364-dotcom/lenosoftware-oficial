import json
import os
from datetime import datetime

class TaskSync:
    def __init__(self):
        self.task_path = 'Fabrica_Harvard/Unified_Business_Vault/team_tasks.json'

    def assign_task(self, collaborator_name, task_description, deadline):
        print(f"[TASK SYNC] Atribuindo missão para: {collaborator_name}")

        new_task = {
            "task_id": f"TASK-{os.urandom(2).hex().upper()}",
            "responsavel": collaborator_name,
            "missao": task_description,
            "prazo": deadline,
            "comando_por": "Leno César & Lumen Onel",
            "status": "Aguardando Execução",
            "data_atribuicao": datetime.now().strftime("%d/%m/%Y %H:%M")
        }

        try:
            if os.path.exists(self.task_path):
                with open(self.task_path, 'r+') as f:
                    data = json.load(f)
                    data.append(new_task)
                    f.seek(0)
                    json.dump(data, f, indent=4)
            else:
                with open(self.task_path, 'w') as f:
                    json.dump([new_task], f, indent=4)
        except Exception as e:
            print(f"[ERRO] Falha ao sincronizar tarefa: {e}")

        print(f"[TASK SYNC] Missão '{new_task['task_id']}' enviada para o dashboard do colaborador.")

if __name__ == "__main__":
    sync = TaskSync()
    # Atribuindo a primeira grande missão para o time administrativo
    sync.assign_task(
        collaborator_name="Time Administrativo",
        task_description="Catalogar entrada de insumos químicos para a BIJU",
        deadline="Hoje às 17h"
    )
