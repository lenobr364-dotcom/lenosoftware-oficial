import os
import xml.etree.ElementTree as ET

import matplotlib.pyplot as plt

file_path = "RAMO 100.xml"
output_png = "Mapa_Projeto_Lumen.png"


def gerar_imagem_projeto(path):
    tree = ET.parse(path)
    root = tree.getroot()
    ns = {"ns": "http://www.landxml.org/schema/LandXML-1.2"}

    norte = []
    leste = []

    for coord in root.findall(".//ns:CoordGeom/ns:Curve/ns:Center", ns):
        raw = coord.text or ""
        parts = raw.split()
        if len(parts) >= 2:
            try:
                norte.append(float(parts[0]))
                leste.append(float(parts[1]))
            except ValueError:
                continue

    if not norte or len(norte) != len(leste):
        print("Erro: Não encontramos coordenadas suficientes para gerar a imagem.")
        return

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(leste, norte, "bo-", label="Alinhamento Aux_Narizes")
    ax.set_title("Visualização Técnica: Projeto RAMO 100 (Nexus Audit)")
    ax.set_xlabel("Leste (Easting)")
    ax.set_ylabel("Norte (Northing)")
    ax.grid(True)
    ax.legend()
    fig.savefig(output_png, dpi=150, bbox_inches="tight")
    print("--- IMAGEM GERADA COM SUCESSO ---")
    print(f"Arquivo '{output_png}' disponível na pasta do QG.")
    plt.show()
    plt.close(fig)


if __name__ == "__main__":
    if os.path.exists(file_path):
        gerar_imagem_projeto(file_path)
    else:
        print(f"Erro: {file_path} não encontrado.")
