# Leno.Software — executado pelo QGIS via: qgis --code "%CAMINHO%\leno_agrimat_qgis_carregar_agrimat.py"
# Define LENO_AGRIMAT_DIR no .bat para a pasta que contém os GeoJSON (esta pasta).

import os
from pathlib import Path

from qgis.core import (
    QgsCoordinateReferenceSystem,
    QgsProject,
    QgsRectangle,
    QgsVectorLayer,
)
from qgis.utils import iface

BASE = Path(os.environ.get("LENO_AGRIMAT_DIR", Path(__file__).resolve().parent)).resolve()

LAYERS = (
    ("leno_agrimat_ptv03_ramo200_eixo.geojson", "Leno Agrimat - PTV03 RAMO 200"),
    ("leno_agrimat_eixos_todos.geojson", "Leno Agrimat - Eixos (todos)"),
    ("leno_agrimat_ramo200_conferencia_pc_pt_pi.geojson", "Leno Agrimat - PC PT PI"),
    ("leno_agrimat_ptv03_ramo200_tin_vertices.geojson", "Leno Agrimat - TIN vertices"),
)

CRS = QgsCoordinateReferenceSystem("EPSG:31981")
QgsProject.instance().setCrs(CRS)

combined = None
for fname, title in LAYERS:
    path = BASE / fname
    if not path.is_file():
        continue
    layer = QgsVectorLayer(str(path), title, "ogr")
    if not layer.isValid():
        continue
    layer.setCrs(CRS)
    QgsProject.instance().addMapLayer(layer)
    r = layer.extent()
    if r is not None and not r.isEmpty():
        if combined is None:
            combined = QgsRectangle(r)
        else:
            combined.combineExtentWith(r)

if combined is not None and not combined.isEmpty():
    iface.mapCanvas().setExtent(combined)
    iface.mapCanvas().refresh()

iface.messageBar().pushMessage(
    "Leno.Software",
    "Camadas Agrimat RAMO 200 carregadas em EPSG:31981 (SIRGAS 2000 / UTM 21S).",
    level=0,
    duration=8,
)
