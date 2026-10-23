import os

# Pasta extraída do OneDrive (estrutura Trimble/SITECH)
caminho_antigo = "Machine Control Data"


def auditar_servico_antigo(diretorio):
    if not os.path.exists(diretorio):
        print("Erro: A pasta extraída não foi encontrada no diretório atual.")
        return

    print("--- INICIANDO AUDITORIA LUMEN NEXUS ---")
    total_arquivos = 0
    total_svl = 0

    for root, _dirs, files in os.walk(diretorio):
        for file in files:
            total_arquivos += 1
            caminho_completo = os.path.join(root, file)
            tamanho_kb = os.path.getsize(caminho_completo) / 1024
            print(f"Arquivo encontrado: {file} | Tamanho: {tamanho_kb:.2f} KB")

            if file.lower().endswith(".svl"):
                total_svl += 1
                print("--> ALERTA: Detectado Alinhamento Antigo (.svl)")

    print("\nVarredura concluída. Compare os tamanhos com o nosso RAMO 100.xml de 2MB.")
    print(f"Resumo: {total_arquivos} arquivo(s), {total_svl} .svl.")


if __name__ == "__main__":
    auditar_servico_antigo(caminho_antigo)
