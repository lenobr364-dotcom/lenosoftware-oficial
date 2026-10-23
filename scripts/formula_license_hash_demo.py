#!/usr/bin/env python3
"""
ChemVault Global — demo de hash de fórmula industrial (espelha lib/formula-industrial-fingerprint.ts).
Uso: python scripts/formula_license_hash_demo.py
"""
from __future__ import annotations

import hashlib
import json
from typing import Any

# Subconjunto mínimo alinhado ao catálogo TypeScript (lib/formulas.ts)
DEMO_FORMULAS: list[dict[str, Any]] = [
    {
        "id": "solupan",
        "code": "CV-SOL-001",
        "name": "Solupan",
        "lastUpdated": "2026-04-02T16:45:00.000Z",
        "composition": "Álcalis (hidróxido de sódio 2–4%)…",
        "mixingInstructions": "Diluir sempre o concentrado em água…",
        "safetyPrecautions": "Corrosivo alcalino…",
    }
]

VERSION = 1


def stable_payload(f: dict[str, Any]) -> dict[str, Any]:
    return {
        "v": VERSION,
        "formulaId": f["id"],
        "code": f["code"],
        "name": f["name"],
        "composition": f["composition"],
        "mixingInstructions": f["mixingInstructions"],
        "safetyPrecautions": f["safetyPrecautions"],
        "lastUpdated": f["lastUpdated"],
    }


def stable_json(p: dict[str, Any]) -> str:
    keys = sorted(p.keys())
    return json.dumps({k: p[k] for k in keys}, separators=(",", ":"), ensure_ascii=False)


def sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def main() -> None:
    for f in DEMO_FORMULAS:
        p = stable_payload(f)
        js = stable_json(p)
        h = sha256_hex(js)
        print(f"{f['code']}  {f['name']}")
        print(f"  SHA256: {h}")


if __name__ == "__main__":
    main()
