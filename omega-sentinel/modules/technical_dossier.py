from __future__ import annotations

from dataclasses import dataclass

from models.formula_record import FormulaRecord


@dataclass
class TechnicalDossierView:
    """Vista executiva derivada do registo de fórmula (texto + tags)."""

    title: str
    summary: str
    licensing_tags: str
    steward: str


def build_dossier_view(record: FormulaRecord) -> TechnicalDossierView:
    body = record.technical_dossier.strip() or "(sem dossiê técnico persistido)"
    return TechnicalDossierView(
        title=record.title,
        summary=body,
        licensing_tags=record.licensing_tags,
        steward=record.steward_author,
    )
