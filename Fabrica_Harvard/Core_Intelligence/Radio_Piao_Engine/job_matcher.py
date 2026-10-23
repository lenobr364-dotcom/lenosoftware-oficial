import json
import os
from datetime import datetime

class JobMatcher:
    def __init__(self):
        self.output_path = 'Fabrica_Harvard/Unified_Business_Vault/job_matches.json'

    def find_best_candidate(self, job_title, required_skills, candidate_pool):
        print(f"[NEXUS MATCHER] Analisando candidatos para a vaga: {job_title}")

        matches = []
        for candidate in candidate_pool:
            # Lógica simples de cruzamento de habilidades
            matching_skills = [skill for skill in required_skills if skill in candidate['skills']]
            score = (len(matching_skills) / len(required_skills)) * 100

            if score >= 70:  # Filtro de qualidade de 70%
                matches.append({
                    "nome": candidate['nome'],
                    "score": f"{score}%",
                    "habilidades_compativeis": matching_skills
                })

        report = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "vaga": job_title,
            "candidatos_selecionados": sorted(
                matches,
                key=lambda x: float(str(x["score"]).rstrip("%")),
                reverse=True,
            )
        }

        with open(self.output_path, 'w') as f:
            json.dump(report, f, indent=4)

        print(f"[SUCCESS] Cruzamento concluído. {len(matches)} candidatos ideais encontrados para {job_title}.")

if __name__ == "__main__":
    matcher = JobMatcher()
    # Exemplo de candidatos simulados para a Rádio Pião
    pool = [
        {"nome": "Operador A", "skills": ["Escavadeira", "NR12", "Cuiabá"]},
        {"nome": "Ajudante B", "skills": ["Limpeza", "Carga", "Cuiabá"]}
    ]
    matcher.find_best_candidate("Operador de Escavadeira", ["Escavadeira", "NR12"], pool)
