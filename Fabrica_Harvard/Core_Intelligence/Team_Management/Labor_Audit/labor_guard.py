import json
import os
from datetime import datetime


class LaborGuard:
    def __init__(self):
        self.log_path = 'Fabrica_Harvard/Unified_Business_Vault/labor_hours.json'

    def log_work_session(self, employee_name, project, hours, activity):
        print(f"[LABOR GUARD] Registrando atividade de: {employee_name}")

        entry = {
            "registro_id": f"LOG-{os.urandom(2).hex().upper()}",
            "colaborador": employee_name,
            "projeto": project,  # Ex: BIJU, ChemVault, Radio Piao
            "horas_alocadas": hours,
            "descricao": activity,
            "data": datetime.now().strftime("%d/%m/%Y"),
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "validacao_holding": "Pendente - Revisão Leno César",
        }

        try:
            if os.path.exists(self.log_path):
                with open(self.log_path, 'r+', encoding='utf-8') as f:
                    data = json.load(f)
                    data.append(entry)
                    f.seek(0)
                    json.dump(data, f, indent=4, ensure_ascii=False)
                    f.truncate()
            else:
                os.makedirs(os.path.dirname(self.log_path), exist_ok=True)
                with open(self.log_path, 'w', encoding='utf-8') as f:
                    json.dump([entry], f, indent=4, ensure_ascii=False)

            print(f"[SUCCESS] Sessão de trabalho de {hours}h registrada para o projeto {project}.")
        except Exception as e:
            print(f"[ERRO] Falha ao registrar horas: {e}")


if __name__ == "__main__":
    guard = LaborGuard()
    # Exemplo: Registro de trabalho do time administrativo na Rádio Pião
    guard.log_work_session(
        employee_name="Time Operacional Rádio Pião",
        project="Radio Piao",
        hours=6.5,
        activity="Conciliação de pautas, follow-up com anunciantes e atualização do CRM Nexus.",
    )
