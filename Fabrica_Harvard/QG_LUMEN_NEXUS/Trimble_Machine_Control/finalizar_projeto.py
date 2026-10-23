import os

# Caminho final no QG para o projeto de Cuiabá (alinhado a gerar_comando_maquina.py)
project_dir = os.path.join("Machine Control Data", "OBRA_110_CUIABA")
svl_file = os.path.join(project_dir, "RAMO_100.svl")


def finalizar_projeto():
    if not os.path.exists(project_dir):
        print("Erro: Pasta do projeto não encontrada.")
        return
    if not os.path.exists(svl_file):
        print(f"Erro: {svl_file} não encontrado. Execute gerar_comando_maquina.py antes.")
        return

    with open(svl_file, "a", encoding="utf-8") as f:
        f.write("ALIGNMENT_TYPE: ROAD\n")
        f.write("UNITS: METRIC\n")
        f.write("COORDINATE_SYSTEM: SIRGAS2000_UTM21S\n")

    print("--- SUCESSO NAVEGACIONAL ---")
    print(f"O arquivo {svl_file} está blindado e pronto para o pen drive.")


if __name__ == "__main__":
    finalizar_projeto()
