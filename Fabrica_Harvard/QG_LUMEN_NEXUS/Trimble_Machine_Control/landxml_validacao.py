import os
import xml.etree.ElementTree as ET

import pandas as pd

# Ajuste o nome do LandXML conforme o arquivo no diretório de trabalho
file_path = "RAMO 100.xml"


def processar_landxml(path):
    tree = ET.parse(path)
    root = tree.getroot()

    ns = {"ns": "http://www.landxml.org/schema/LandXML-1.2"}

    data_pontos = []

    for alignment in root.findall(".//ns:Alignment", ns):
        nome = alignment.get("name")
        print(f"Processando Alinhamento: {nome}")

        for coord in alignment.findall(".//ns:CoordGeom/ns:Curve/ns:Center", ns):
            coords = (coord.text or "").split()
            if len(coords) >= 2:
                data_pontos.append(
                    {
                        "Alinhamento": nome,
                        "Norte": coords[0],
                        "Leste": coords[1],
                    }
                )

    df = pd.DataFrame(data_pontos)
    out = "Validacao_Lumen_Nexus.csv"
    df.to_csv(out, index=False)
    print("\n--- VARREDURA CONCLUÍDA ---")
    print(f"Relatório gerado: {out}")
    print("Pronto para conversão .SVD / .SVL")


if __name__ == "__main__":
    if os.path.exists(file_path):
        processar_landxml(file_path)
    else:
        print(f"Erro: Arquivo {file_path} não encontrado no QG.")
