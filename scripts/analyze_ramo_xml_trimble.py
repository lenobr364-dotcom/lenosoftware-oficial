#!/usr/bin/env python3
"""
Análise geoespacial de XML (LandXML e padrões genéricos) para pré-validação
antes de export .svd/.svl no Trimble Business Center ou Siteworks.
Uso: python scripts/analyze_ramo_xml_trimble.py "caminho\\RAMO 200.xml"
"""
from __future__ import annotations

import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Iterable

# Tags/atributos comuns de elevação (case-insensitive match no localname)
Z_LOCAL_NAMES = frozenset(
    {
        "z",
        "elev",
        "elevation",
        "height",
        "alt",
        "altitude",
        "level",
        "rl",
        "quota",
    }
)
Z_ATTR_NAMES = frozenset(
    {
        "z",
        "elev",
        "elevation",
        "height",
        "alt",
        "altitude",
        "o",
        "designelev",
        "designelevation",
    }
)

# LandXML: Coord em Pnt costuma ser "N E Z" ou "E N Z" — assumimos Northing Easting Elev (ordem típica BR/LandXML)
COORD_SPLIT = re.compile(r"[\s,;]+")


def local_name(tag: str) -> str:
    if "}" in tag:
        return tag.split("}", 1)[1].lower()
    return tag.lower()


def try_float(s: str) -> float | None:
    s = s.strip()
    if not s:
        return None
    try:
        return float(s.replace(",", "."))
    except ValueError:
        return None


def iter_all_elems(root: ET.Element) -> Iterable[ET.Element]:
    yield root
    for el in root.iter():
        if el is not root:
            yield el


def collect_elevations_and_offsets(
    root: ET.Element,
) -> tuple[list[tuple[float, float | None, float | None, str]], list[str], list[str]]:
    """
    Retorna:
      - lista de (z, n, e, origem_descritiva)
      - avisos de offset em alinhamento (texto)
      - alertas de ausência de offset onde esperado
    """
    points: list[tuple[float, float | None, float | None, str]] = []
    offset_notes: list[str] = []
    missing_offset: list[str] = []

    for el in iter_all_elems(root):
        ln = local_name(el.tag)
        attrib_lower = {k.lower(): v for k, v in el.attrib.items()}

        # --- LandXML Pnt / CgPoint: texto "N E Z" ou "E N Z" (reportamos como lidos: N,E,Z na ordem do ficheiro) ---
        if ln in ("pnt", "cgpoint"):
            raw = (el.text or "").strip().strip("{}").strip()
            raw = " ".join(raw.split())
            z_attr = try_float(attrib_lower.get("o", "") or attrib_lower.get("elev", "") or "")
            if raw:
                parts = COORD_SPLIT.split(raw.strip())
                nums = [try_float(p) for p in parts if try_float(p) is not None]
                if len(nums) >= 3:
                    n, e, z = nums[0], nums[1], nums[2]
                    points.append((z, n, e, f"<{ln}> texto 3+ valores"))
                elif len(nums) == 1 and z_attr is None:
                    points.append((nums[0], None, None, f"<{ln}> (um valor)"))
            if z_attr is not None:
                n2 = try_float(attrib_lower.get("northing", "") or "")
                e2 = try_float(attrib_lower.get("easting", "") or "")
                points.append((z_attr, n2, e2, f"<{ln}> attr o/elev"))

        # --- Atributos Northing/Easting + Elev ---
        n = try_float(attrib_lower.get("northing", "") or attrib_lower.get("y", "") or "")
        e = try_float(attrib_lower.get("easting", "") or attrib_lower.get("x", "") or "")
        for ak, av in attrib_lower.items():
            if ak in Z_ATTR_NAMES:
                if ln == "cgpoint" and ak in ("o", "elev", "elevation"):
                    continue  # já tratado no bloco CgPoint (evita duplicar Z)
                z = try_float(av)
                if z is not None:
                    points.append((z, n, e, f"attr {ak} em <{ln}>"))

        # --- Filhos / texto com tag de elevação ---
        if ln in Z_LOCAL_NAMES and el.text:
            z = try_float(el.text)
            if z is not None:
                points.append((z, n, e, f"texto em <{ln}>"))

        # --- Alinhamento horizontal: offset (LandXML: <Alignment>, não o wrapper <Alignments>) ---
        if ln in ("alignment", "horizontalalignment", "horizalignment"):
            has_offset = any(
                "offset" in local_name(c.tag).lower() or "offset" in k.lower()
                for c in el
                for k in c.attrib
            )
            name = attrib_lower.get("name", el.get("name", "")) or "(sem nome)"
            if has_offset:
                offset_notes.append(f"Alinhamento '{name}': elemento(s) com 'offset' encontrado(s) sob {ln}.")
            else:
                missing_offset.append(
                    f"Alinhamento '{name}' (<{ln}>): nenhuma sub-tag/atributo com 'offset' detectado neste ramo XML."
                )

        if "offset" in ln and el.text:
            offset_notes.append(f"Nó <{ln}>: {el.text.strip()[:120]}")

    return points, offset_notes, missing_offset


def main() -> int:
    if len(sys.argv) < 2:
        print("Uso: python scripts/analyze_ramo_xml_trimble.py \"caminho\\arquivo.xml\"", file=sys.stderr)
        return 2
    path = Path(sys.argv[1])
    if not path.is_file():
        print(f"ERRO: arquivo não encontrado: {path.resolve()}", file=sys.stderr)
        return 2

    try:
        tree = ET.parse(path)
    except ET.ParseError as ex:
        print(f"ERRO de parse XML: {ex}", file=sys.stderr)
        return 3

    root = tree.getroot()
    points, offset_ok, offset_missing = collect_elevations_and_offsets(root)

    zs_only = [p[0] for p in points]
    z_max = max(zs_only) if zs_only else None
    z_min = min(zs_only) if zs_only else None

    print("=== RELATÓRIO RAMO XML (pré-Trimble) ===")
    print(f"Arquivo: {path.resolve()}")
    print(f"Total de amostras Z coletadas: {len(points)}")
    if z_max is not None:
        print(f"Z mínimo: {z_min:.6f} m  |  Z máximo: {z_max:.6f} m")

    limit = 30.0
    above = [(z, n, e, src) for z, n, e, src in points if z > limit + 1e-9]
    print(f"\n--- Cotas estritamente superiores a {limit:.2f} m ---")
    if not above:
        print(f"Nenhuma amostra > {limit:.2f} m (tolerância numérica 1e-9 m).")
    else:
        for z, n, e, src in sorted(above, key=lambda x: -x[0]):
            nn = f"{n:.6f}" if n is not None else "N/D"
            ee = f"{e:.6f}" if e is not None else "N/D"
            print(f"  Z = {z:.6f} m  |  N = {nn}  |  E = {ee}  |  origem: {src}")

    print("\n--- Offset em alinhamentos (heurística XML) ---")
    if offset_ok:
        for line in offset_ok:
            print(f"  [info] {line}")
    if offset_missing:
        print("  [ALERTA] Possível ausência de parâmetros de offset nos blocos analisados:")
        for line in offset_missing:
            print(f"    - {line}")
    if not offset_ok and not offset_missing:
        print("  Nenhum bloco de alinhamento reconhecido por nome de tag (alignment/align/...).")
        print("  Verificar manualmente no software de origem se offsets são exigidos.")

    # Divergência vs limite 30 m
    print("\n--- Divergência auditoria (limite 30,00 m) ---")
    if above:
        print("  STATUS: NÃO CONFORME — existem cotas acima de 30,00 m.")
        return 1
    print("  STATUS: em relação ao critério 'cota > 30,00 m', não há violação nas amostras extraídas.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
