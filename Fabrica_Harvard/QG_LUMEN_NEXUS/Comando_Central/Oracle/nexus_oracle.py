import json
import os
from datetime import datetime


class NexusOracle:
    def __init__(self):
        self.oracle_path = 'Fabrica_Harvard/QG_LUMEN_NEXUS/Comando_Central/Oracle/diretrizes_mestras.json'

    def register_directive(self, topic, directive, priority):
        print(f"[ORACLE] Registrando Vontade do Sócio: {topic}")

        entry = {
            "id_comando": f"CMD-{os.urandom(2).hex().upper()}",
            "data_registro": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "assunto": topic,
            "diretriz_soberana": directive,
            "prioridade": priority,  # Ex: Absoluta, Alta, Consultiva
            "status": "Vigorando",
            "autor": "Leno César",
        }

        try:
            if os.path.exists(self.oracle_path):
                with open(self.oracle_path, 'r+', encoding='utf-8') as f:
                    data = json.load(f)
                    data.append(entry)
                    f.seek(0)
                    json.dump(data, f, indent=4, ensure_ascii=False)
                    f.truncate()
            else:
                os.makedirs(os.path.dirname(self.oracle_path), exist_ok=True)
                with open(self.oracle_path, 'w', encoding='utf-8') as f:
                    json.dump([entry], f, indent=4, ensure_ascii=False)

            print(f"[SUCCESS] Diretriz sobre '{topic}' fixada como Lei no QG.")
        except Exception as e:
            print(f"[ERRO] Falha ao registrar no Oracle: {e}")


if __name__ == "__main__":
    oracle = NexusOracle()
    # Exemplo: Definindo o isolamento do laboratório
    oracle.register_directive(
        topic="Acesso ao Laboratório P&D",
        directive="Silêncio total. Apenas Leno César e Lumen Nexus têm autoridade de modificação.",
        priority="Absoluta",
    )
