import json
import os
from datetime import datetime


def generate_candidate_profile(candidate_data):
    print(f"[RESUME BUILDER] Gerando ficha profissional para: {candidate_data['nome']}")

    # Estrutura do documento de apresentação para a construtora
    profile = {
        "cabecalho": "RÁDIO PIÃO - INTELIGÊNCIA EM RECRUTAMENTO",
        "parceria": "Leno.Software & BIJU",
        "data_emissao": datetime.now().strftime("%d/%m/%Y"),
        "candidato": candidate_data['nome'],
        "qualificacao": candidate_data.get('score', '100%'),
        "competencias_validadas": candidate_data.get('habilidades_compativeis', []),
        "status_verificacao": "Aprovado pelo Nexus Matcher",
        "localidade_base": "Grande Cuiabá - MT"
    }

    filename = f"Fabrica_Harvard/Unified_Business_Vault/FICHA_{candidate_data['nome'].replace(' ', '_')}.json"

    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(profile, f, indent=4)

    print(f"[SUCCESS] Perfil exportado com sucesso: {filename}")


if __name__ == "__main__":
    # Simulando a exportação do melhor candidato encontrado no comando anterior
    exemplo_candidato = {
        "nome": "Operador de Elite Cuiaba",
        "score": "95%",
        "habilidades_compativeis": ["Escavadeira Hidráulica", "NR12", "Manutenção Preventiva"]
    }
    generate_candidate_profile(exemplo_candidato)
