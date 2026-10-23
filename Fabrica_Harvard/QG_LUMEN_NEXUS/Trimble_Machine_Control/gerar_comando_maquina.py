import csv
import os

# Estrutura de pastas alinhada à Trimble/SITECH (Machine Control Data)
project_name = "OBRA_110_CUIABA"
base_path = "Machine Control Data"
project_path = os.path.join(base_path, project_name)

if not os.path.exists(project_path):
    os.makedirs(project_path)
    print(f"Diretório criado: {project_path}")


def gerar_comando_maquina():
    val_file = "Validacao_Lumen_Nexus.csv"

    if not os.path.exists(val_file):
        print("Erro: Execute o primeiro script de varredura antes deste.")
        return

    print(f"Lendo dados de: {val_file}")
    svl_path = os.path.join(project_path, "RAMO_100.svl")

    with open(svl_path, "w", encoding="utf-8") as f:
        f.write("TRIMBLE_LIN_DATA_V1\n")
        f.write(f"PROJECT_NAME: {project_name}\n")
        # Trecho de referência a partir do CSV (formato final no equipamento pode exigir conversão específica)
        f.write("# REF_VALIDACAO_CSV_BEGIN\n")
        with open(val_file, newline="", encoding="utf-8") as vf:
            for row in csv.DictReader(vf):
                al = row.get("Alinhamento", "")
                n = row.get("Norte", "")
                e = row.get("Leste", "")
                f.write(f"{al},{n},{e}\n")
        f.write("# REF_VALIDACAO_CSV_END\n")

    print(f"Arquivo .SVL (Alinhamento) gerado em: {project_path}")
    print("Pronto para o pen drive!")


if __name__ == "__main__":
    gerar_comando_maquina()
