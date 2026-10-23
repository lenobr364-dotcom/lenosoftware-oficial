#!/usr/bin/env python3
"""
Leno.Software — Extrai pontos de conferência PC, PT e PI do LandXML (Curves/Spirals).
PC = início do arco (<Start> em <Curve>); PT = fim (<End>); PI = <PI> quando existir.
Uso:
  python scripts/leno_agrimat_conferencia_curvas.py "C:\\...\\RAMO 200.xml" [pasta_saida]
"""
from __future__ import annotations

import csv
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {"lx": "http://www.landxml.org/schema/LandXML-1.2"}
EPSG = "urn:ogc:def:crs:EPSG::31981"


def local_tag(el: ET.Element) -> str:
    return el.tag.split("}")[-1] if "}" in el.tag else el.tag


def parse_xy(text: str) -> tuple[float, float]:
    parts = text.replace(",", ".").split()
    return float(parts[0]), float(parts[1])


def feat_point(
    n: float,
    e: float,
    props: dict,
) -> dict:
    return {
        "type": "Feature",
        "properties": props,
        "geometry": {"type": "Point", "coordinates": [e, n]},
    }


def collect_rows(root: ET.Element) -> list[dict]:
    rows: list[dict] = []
    for align in root.findall(".//lx:Alignment", NS):
        aname = align.get("name", "")
        cg = align.find("lx:CoordGeom", NS)
        if cg is None:
            continue
        seg_i = 0
        curve_i = 0
        spiral_i = 0
        for child in cg:
            tag = local_tag(child)
            seg_i += 1
            if tag == "Curve":
                curve_i += 1
                radius = child.get("radius", "")
                rot = child.get("rot", "")
                delta = child.get("delta", "")
                s_el, e_el, pi_el = (
                    child.find("lx:Start", NS),
                    child.find("lx:End", NS),
                    child.find("lx:PI", NS),
                )
                if s_el is not None and s_el.text:
                    n, e = parse_xy(s_el.text)
                    rows.append(
                        {
                            "alinhamento": aname,
                            "seq_geom": seg_i,
                            "id_curva": curve_i,
                            "tipo_ponto": "PC",
                            "N_m": n,
                            "E_m": e,
                            "Raio_m": radius,
                            "Rotacao": rot,
                            "Delta_graus": delta,
                            "notas": "Início do arco (Start)",
                        }
                    )
                if e_el is not None and e_el.text:
                    n, e = parse_xy(e_el.text)
                    rows.append(
                        {
                            "alinhamento": aname,
                            "seq_geom": seg_i,
                            "id_curva": curve_i,
                            "tipo_ponto": "PT",
                            "N_m": n,
                            "E_m": e,
                            "Raio_m": radius,
                            "Rotacao": rot,
                            "Delta_graus": delta,
                            "notas": "Fim do arco (End)",
                        }
                    )
                if pi_el is not None and pi_el.text:
                    n, e = parse_xy(pi_el.text)
                    rows.append(
                        {
                            "alinhamento": aname,
                            "seq_geom": seg_i,
                            "id_curva": curve_i,
                            "tipo_ponto": "PI",
                            "N_m": n,
                            "E_m": e,
                            "Raio_m": radius,
                            "Rotacao": rot,
                            "Delta_graus": delta,
                            "notas": "Ponto de interseção das tangentes (PI)",
                        }
                    )
            elif tag == "Spiral":
                spiral_i += 1
                for tipo, node, nota in (
                    ("PC_Espiral", child.find("lx:Start", NS), "Início clothóide"),
                    ("PT_Espiral", child.find("lx:End", NS), "Fim clothóide"),
                    ("PI_Espiral", child.find("lx:PI", NS), "PI da espiral"),
                ):
                    if node is None or not node.text:
                        continue
                    n, e = parse_xy(node.text)
                    rows.append(
                        {
                            "alinhamento": aname,
                            "seq_geom": seg_i,
                            "id_curva": spiral_i,
                            "tipo_ponto": tipo,
                            "N_m": n,
                            "E_m": e,
                            "Raio_m": child.get("radiusStart", "") + "→" + child.get("radiusEnd", ""),
                            "Rotacao": child.get("rot", ""),
                            "Delta_graus": child.get("theta", ""),
                            "notas": nota,
                        }
                    )
    return rows


def main() -> int:
    if len(sys.argv) < 2:
        print(
            "Uso: python scripts/leno_agrimat_conferencia_curvas.py "
            '"C:\\caminho\\RAMO 200.xml" [pasta_saida]',
            file=sys.stderr,
        )
        return 2
    src = Path(sys.argv[1])
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("chemvault-public/agrimat-ramo200-qgis")
    if not src.is_file():
        print(f"ERRO: {src}", file=sys.stderr)
        return 2
    out.mkdir(parents=True, exist_ok=True)

    root = ET.parse(src).getroot()
    rows = collect_rows(root)

    geo_features = [
        feat_point(
            r["N_m"],
            r["E_m"],
            {k: v for k, v in r.items() if k not in ("N_m", "E_m")},
        )
        for r in rows
    ]
    gj = {
        "type": "FeatureCollection",
        "name": "leno_agrimat_conferencia_pc_pt_pi",
        "crs": {"type": "name", "properties": {"name": EPSG}},
        "features": geo_features,
    }
    gj_path = out / "leno_agrimat_ramo200_conferencia_pc_pt_pi.geojson"
    with open(gj_path, "w", encoding="utf-8") as f:
        json.dump(gj, f, ensure_ascii=False, indent=2)

    csv_path = out / "leno_agrimat_ramo200_conferencia_pc_pt_pi.csv"
    if rows:
        with open(csv_path, "w", encoding="utf-8-sig", newline="") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            w.writeheader()
            w.writerows(rows)

    print(f"OK: {gj_path} ({len(rows)} pontos)")
    print(f"OK: {csv_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
