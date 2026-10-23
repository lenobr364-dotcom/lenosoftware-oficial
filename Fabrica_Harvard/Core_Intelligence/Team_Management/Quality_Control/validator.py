import json
import os
from datetime import datetime

def validate_task_completion(task_id, quality_score):
    print(f"[QUALITY CONTROL] Analisando entrega da missão: {task_id}")

    task_path = 'Fabrica_Harvard/Unified_Business_Vault/team_tasks.json'

    if os.path.exists(task_path):
        with open(task_path, 'r+') as f:
            tasks = json.load(f)
            found = False
            for task in tasks:
                if task['task_id'] == task_id:
                    task['status'] = "Concluído e Validado" if quality_score >= 8 else "Necessita Ajuste"
                    task['data_validacao'] = datetime.now().strftime("%d/%m/%Y %H:%M")
                    task['nota_qualidade'] = f"{quality_score}/10"
                    found = True
                    break

            if found:
                f.seek(0)
                json.dump(tasks, f, indent=4)
                f.truncate()
                print(f"[STATUS] Missão {task_id} processada com nota {quality_score}.")
            else:
                print(f"[ERRO] Missão {task_id} não encontrada no banco de dados.")
    else:
        print("[ERRO] Banco de tarefas não localizado.")

if __name__ == "__main__":
    # Exemplo de validação de uma tarefa executada pelo time
    # Nota 10 = Padrão Leno César de Qualidade
    validate_task_completion("TASK-XXXX", 10)
