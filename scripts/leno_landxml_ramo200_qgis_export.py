#!/usr/bin/env python3
"""
Leno.Software — Export RAMO 200 (LandXML Civil 3D) para camadas QGIS.
Gera GeoJSON projetado (N/E em metros) com CRS EPSG:31981 (SIRGAS 2000 / UTM 21S).
Uso:
  python scripts/leno_landxml_ramo200_qgis_export.py "C:\\Users\\...\\RAMO 200.xml" [pasta_saida]
"""
from __future__ import annotations

import json
import math
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {"lx": "http://www.landxml.org/schema/LandXML-1.2"}
EPSG_SIRGAS_21S = "urn:ogc:def:crs:EPSG::31981"


def local_tag(el: ET.Element) -> str:
    return el.tag.split("}")[-1] if "}" in el.tag else el.tag


def parse_xy(text: str) -> tuple[float, float]:
    parts = text.replace(",", ".").split()
    if len(parts) < 2:
        raise ValueError(f"coord inválida: {text!r}")
    return float(parts[0]), float(parts[1])


def parse_xyz(text: str) -> tuple[float, float, float]:
    parts = text.replace(",", ".").split()
    if len(parts) < 3:
        raise ValueError(f"coord inválida: {text!r}")
    return float(parts[0]), float(parts[1]), float(parts[2])


def geojson_fc(features: list, name: str) -> dict:
    return {
        "type": "FeatureCollection",
        "name": name,
        "crs": {"type": "name", "properties": {"name": EPSG_SIRGAS_21S}},
        "features": features,
    }


def arc_points(
    n0: float,
    e0: float,
    n1: float,
    e1: float,
    cn: float,
    ce: float,
    rot: str,
    delta_deg: float,
    nseg: int = 48,
) -> list[tuple[float, float]]:
    """Vértices ao longo do arco usando raio implícito (distância Centro→Start) e delta do LandXML."""
    r = math.hypot(n0 - cn, e0 - ce)
    if r < 1e-6:
        return [(n0, e0), (n1, e1)]
    phi0 = math.atan2(e0 - ce, n0 - cn)
    delta = math.radians(delta_deg)
    if rot.lower() == "cw":
        sweep = -delta
    else:
        sweep = delta
    out: list[tuple[float, float]] = []
    for i in range(nseg + 1):
        t = i / nseg
        phi = phi0 + t * sweep
        out.append((cn + r * math.cos(phi), ce + r * math.sin(phi)))
    return out


def alignment_to_linestring(align: ET.Element) -> list[tuple[float, float]]:
    pts: list[tuple[float, float]] = []
    cg = align.find("lx:CoordGeom", NS)
    if cg is None:
        return pts
    for child in cg:
        tag = local_tag(child)
        if tag == "Line":
            s = child.find("lx:Start", NS)
            e = child.find("lx:End", NS)
            if s is None or e is None or not s.text or not e.text:
                continue
            n0, e0 = parse_xy(s.text)
            n1, e1 = parse_xy(e.text)
            if not pts:
                pts.append((n0, e0))
            pts.append((n1, e1))
        elif tag == "Curve":
            s = child.find("lx:Start", NS)
            c = child.find("lx:Center", NS)
            e = child.find("lx:End", NS)
            if s is None or c is None or e is None:
                continue
            if not s.text or not c.text or not e.text:
                continue
            n0, e0 = parse_xy(s.text)
            cn, ce = parse_xy(c.text)
            n1, e1 = parse_xy(e.text)
            rot = child.get("rot", "ccw")
            delta = float(child.get("delta", "0").replace(",", "."))
            arc = arc_points(n0, e0, n1, e1, cn, ce, rot, delta)
            if not pts:
                pts.extend(arc)
            else:
                if math.hypot(arc[0][0] - pts[-1][0], arc[0][1] - pts[-1][1]) > 0.001:
                    pts.append(arc[0])
                pts.extend(arc[1:])
        elif tag == "Spiral":
            s = child.find("lx:Start", NS)
            e = child.find("lx:End", NS)
            if s is not None and e is not None and s.text and e.text:
                n0, e0 = parse_xy(s.text)
                n1, e1 = parse_xy(e.text)
                if not pts:
                    pts.append((n0, e0))
                pts.append((n1, e1))
    return pts


def bearing_from_north_cw_deg(n0: float, e0: float, n1: float, e1: float) -> float:
    """Direção no plano: azimute horário a partir do Norte geográfico (0°=N, 90°=L)."""
    dn, de = n1 - n0, e1 - e0
    ang = math.degrees(math.atan2(de, dn))
    if ang < 0:
        ang += 360.0
    return ang


def dir_landxml_deg(n0: float, e0: float, n1: float, e1: float) -> float:
    """Ângulo no sentido Civil 3D/LandXML atributo `dir` da reta: atan2(ΔN, ΔE) em graus."""
    dn, de = n1 - n0, e1 - e0
    ang = math.degrees(math.atan2(dn, de))
    if ang < 0:
        ang += 360.0
    return ang


def main() -> int:
    if len(sys.argv) < 2:
        print(
            "Uso: python scripts/leno_landxml_ramo200_qgis_export.py "
            '"C:\\caminho\\RAMO 200.xml" [pasta_saida]',
            file=sys.stderr,
        )
        return 2
    src = Path(sys.argv[1])
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("chemvault-public/agrimat-ramo200-qgis")
    if not src.is_file():
        print(f"ERRO: ficheiro não encontrado: {src}", file=sys.stderr)
        return 2
    out_dir.mkdir(parents=True, exist_ok=True)

    tree = ET.parse(src)
    root = tree.getroot()

    alignments = root.findall(".//lx:Alignment", NS)
    features_axes = []
    for al in alignments:
        name = al.get("name", "")
        ls = alignment_to_linestring(al)
        if len(ls) < 2:
            continue
        coords = [[p[1], p[0]] for p in ls]
        a0 = bearing_from_north_cw_deg(ls[0][0], ls[0][1], ls[1][0], ls[1][1])
        a1 = bearing_from_north_cw_deg(ls[-2][0], ls[-2][1], ls[-1][0], ls[-1][1])
        d0 = dir_landxml_deg(ls[0][0], ls[0][1], ls[1][0], ls[1][1])
        d1 = dir_landxml_deg(ls[-2][0], ls[-2][1], ls[-1][0], ls[-1][1])
        features_axes.append(
            {
                "type": "Feature",
                "properties": {
                    "name": name,
                    "length_m": float(al.get("length", "0") or 0),
                    "staStart": al.get("staStart", ""),
                    "azimute_N_horario_deg": round(a0, 6),
                    "dir_landxml_atan2_dN_dE_deg": round(d0, 6),
                    "azimute_fim_N_horario_deg": round(a1, 6),
                    "dir_landxml_fim_deg": round(d1, 6),
                },
                "geometry": {"type": "LineString", "coordinates": coords},
            }
        )

    ramo200 = [f for f in features_axes if f["properties"].get("name") == "PTV03-RAMO 200"]
    path_axis = out_dir / "leno_agrimat_eixos_todos.geojson"
    path_r200 = out_dir / "leno_agrimat_ptv03_ramo200_eixo.geojson"
    with open(path_axis, "w", encoding="utf-8") as f:
        json.dump(geojson_fc(features_axes, "Eixos LandXML"), f, ensure_ascii=False, indent=2)
    with open(path_r200, "w", encoding="utf-8") as f:
        json.dump(geojson_fc(ramo200 if ramo200 else [], "PTV03-RAMO 200"), f, ensure_ascii=False, indent=2)

    tin_points = []
    surf = root.find('.//lx:Surface[@name="PTV03-RAMO 200 - TOP"]', NS)
    if surf is not None:
        pnts = surf.find(".//lx:Pnts", NS)
        if pnts is not None:
            for p in pnts.findall("lx:P", NS):
                if not p.text:
                    continue
                n, e, z = parse_xyz(p.text)
                tin_points.append(
                    {
                        "type": "Feature",
                        "properties": {
                            "id": p.get("id", ""),
                            "Z_m": z,
                            "surface": "PTV03-RAMO 200 - TOP",
                        },
                        "geometry": {"type": "Point", "coordinates": [e, n, z]},
                    }
                )
    path_tin = out_dir / "leno_agrimat_ptv03_ramo200_tin_vertices.geojson"
    with open(path_tin, "w", encoding="utf-8") as f:
        json.dump(geojson_fc(tin_points, "TIN vértices"), f, ensure_ascii=False, indent=2)

    meta = {
        "fonte": str(src.resolve()),
        "crs_camadas": "EPSG:31981 (SIRGAS 2000 / UTM zona 21S)",
        "nota_geojson_xyz": "Pontos TIN usam [E, N, Z]; LineString usa [E, N].",
        "eixos_exportados": len(features_axes),
        "vertices_tin": len(tin_points),
        "leno_software": "Agrimat RAMO 200 — pacote QGIS",
    }
    with open(out_dir / "leno_agrimat_metadata.json", "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    print(f"OK: {path_axis}")
    print(f"OK: {path_r200}")
    print(f"OK: {path_tin}")
    print(f"OK: {out_dir / 'leno_agrimat_metadata.json'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
