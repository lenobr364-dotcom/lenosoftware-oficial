from __future__ import annotations

from dataclasses import dataclass


@dataclass
class FormulaRecord:
    """Registo industrial alinhado ao modelo ChemVault / Prisma."""

    id: str
    title: str
    product_line: str
    raw_materials: str
    preparation_method: str
    dilution_details: str
    chemical_equivalence: str = ""
    technical_dossier: str = ""
    hardware_integration_profile: str = ""
    licensing_tags: str = ""
    steward_author: str = "Leno César"
