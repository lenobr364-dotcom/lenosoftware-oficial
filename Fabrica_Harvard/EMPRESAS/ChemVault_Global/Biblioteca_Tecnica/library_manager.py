import json
import os
from datetime import datetime


class LibraryManager:
    def __init__(self):
        self.catalog_path = 'Fabrica_Harvard/EMPRESAS/ChemVault_Global/Biblioteca_Tecnica/catalogo_conhecimento.json'

    def index_document(self, title, category, author, summary):
        print(f"[BIBLIOTECA] Indexando novo ativo intelectual: {title}")

        entry = {
            "doc_id": f"LIB-{os.urandom(2).hex().upper()}",
            "titulo": title,
            "categoria": category,  # Ex: Manuais Caterpillar, Fórmulas, Procedimentos Químicos
            "autor": author,
            "resumo": summary,
            "data_indexacao": datetime.now().strftime("%d/%m/%Y"),
            "acesso": "Restrito: Leno César & Lumen Nexus",
        }

        try:
            if os.path.exists(self.catalog_path):
                with open(self.catalog_path, 'r+', encoding='utf-8') as f:
                    data = json.load(f)
                    data.append(entry)
                    f.seek(0)
                    json.dump(data, f, indent=4, ensure_ascii=False)
                    f.truncate()
            else:
                os.makedirs(os.path.dirname(self.catalog_path), exist_ok=True)
                with open(self.catalog_path, 'w', encoding='utf-8') as f:
                    json.dump([entry], f, indent=4, ensure_ascii=False)

            print(f"[SUCCESS] '{title}' agora faz parte do acervo permanente da Holding.")
        except Exception as e:
            print(f"[ERRO] Falha ao indexar documento: {e}")


if __name__ == "__main__":
    lib = LibraryManager()
    # Exemplo: Indexando um manual técnico de manutenção preventiva
    lib.index_document(
        title="Manual de Manutenção Preventiva - Motores Diesel",
        category="Manuais Caterpillar",
        author="Leno César",
        summary="Procedimentos de análise de fluidos e troca de componentes críticos para motores de alta performance.",
    )
