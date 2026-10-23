from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

from models.formula_record import FormulaRecord


@dataclass
class EcoBocalProfile:
    compatible: bool
    notes: str = ""


def parse_hardware_profile(record: FormulaRecord) -> dict[str, Any]:
    raw = record.hardware_integration_profile.strip()
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"raw_text": raw}


def eco_bocal_from_record(record: FormulaRecord) -> EcoBocalProfile | None:
    data = parse_hardware_profile(record)
    eco = data.get("ecoBocal")
    if not isinstance(eco, dict):
        return None
    return EcoBocalProfile(
        compatible=bool(eco.get("compatible")),
        notes=str(eco.get("notes") or ""),
    )
