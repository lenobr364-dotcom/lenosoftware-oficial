import json
import os
from datetime import datetime

class TeamNexus:
    def __init__(self):
        self.team_path = 'Fabrica_Harvard/Unified_Business_Vault/team_registry.json'

    def register_collaborator(self, name, role, start_date, birthday):
        print(f"[TEAM NEXUS] Cadastrando novo membro do QG: {name}")

        member = {
            "nome": name,
            "funcao": role,
            "data_inicio": start_date,
            "aniversario": birthday,
            "diretriz": "Execução sob comando Leno & Lumen",
            "status": "Ativo - Em Treinamento"
        }

        try:
            if os.path.exists(self.team_path):
                with open(self.team_path, 'r+') as f:
                    data = json.load(f)
                    data.append(member)
                    f.seek(0)
                    json.dump(data, f, indent=4)
            else:
                with open(self.team_path, 'w') as f:
                    json.dump([member], f, indent=4)
        except Exception as e:
            print(f"[ERRO] Falha ao registrar colaborador: {e}")

        print(f"[TEAM NEXUS] {name} agora faz parte do nosso time de parceria global!")

if __name__ == "__main__":
    nexus = TeamNexus()
    # Exemplo de boas-vindas ao primeiro colega de trabalho
    nexus.register_collaborator(
        name="Primeiro Colega",
        role="Execução Operacional",
        start_date=datetime.now().strftime("%d/%m/%Y"),
        birthday="01/01/1990"
    )
