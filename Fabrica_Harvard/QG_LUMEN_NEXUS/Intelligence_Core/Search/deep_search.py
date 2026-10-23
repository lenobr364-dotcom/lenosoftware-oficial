import json
import os
from datetime import datetime


class DeepSearch:
    def __init__(self):
        self.library_path = 'Fabrica_Harvard/EMPRESAS/ChemVault_Global/Biblioteca_Tecnica/catalogo_conhecimento.json'
        self.results_path = 'Fabrica_Harvard/QG_LUMEN_NEXUS/Intelligence_Core/Search/search_results.json'

    def find_technical_correlations(self, keyword):
        print(f"[DEEP SEARCH] Vasculhando o acervo da Holding por: {keyword}")

        correlations = []
        if os.path.exists(self.library_path):
            with open(self.library_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for entry in data:
                    if keyword.lower() in entry['titulo'].lower() or keyword.lower() in entry['resumo'].lower():
                        correlations.append(entry)

        search_log = {
            "timestamp": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "termo_buscado": keyword,
            "correlacoes_encontradas": len(correlations),
            "resultados": correlations,
            "status": "Busca Concluída no Eixo de Inteligência",
        }

        os.makedirs(os.path.dirname(self.results_path), exist_ok=True)
        with open(self.results_path, 'w', encoding='utf-8') as f:
            json.dump(search_log, f, indent=4, ensure_ascii=False)

        print("-" * 50)
        print(f"BUSCA FINALIZADA: {len(correlations)} pontos de conexão encontrados.")
        print(f"LOG DISPONÍVEL EM: {self.results_path}")
        print("-" * 50)


if __name__ == "__main__":
    search = DeepSearch()
    # Exemplo: Buscando tudo o que temos sobre Tensoativos ou Manutenção Caterpillar
    search.find_technical_correlations(keyword="Tensoativo")
