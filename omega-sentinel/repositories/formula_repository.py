from __future__ import annotations

import sqlite3
import uuid
from pathlib import Path

import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from db.database import connect, init_db
from models.formula_record import FormulaRecord


def row_to_record(row: sqlite3.Row) -> FormulaRecord:
    return FormulaRecord(
        id=row["id"],
        title=row["title"],
        product_line=row["product_line"],
        raw_materials=row["raw_materials"],
        preparation_method=row["preparation_method"],
        dilution_details=row["dilution_details"],
        chemical_equivalence=row["chemical_equivalence"] or "",
        technical_dossier=row["technical_dossier"] or "",
        hardware_integration_profile=row["hardware_integration_profile"] or "",
        licensing_tags=row["licensing_tags"] or "",
        steward_author=row["steward_author"] or "Leno César",
    )


def list_formulas(conn: sqlite3.Connection) -> list[FormulaRecord]:
    cur = conn.execute("SELECT * FROM formula ORDER BY title ASC")
    return [row_to_record(r) for r in cur.fetchall()]


def insert_formula(conn: sqlite3.Connection, rec: FormulaRecord) -> str:
    fid = rec.id or str(uuid.uuid4())
    conn.execute(
        """
        INSERT INTO formula (
          id, title, product_line, raw_materials, preparation_method, dilution_details,
          chemical_equivalence, technical_dossier, hardware_integration_profile,
          licensing_tags, steward_author
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            fid,
            rec.title,
            rec.product_line,
            rec.raw_materials,
            rec.preparation_method,
            rec.dilution_details,
            rec.chemical_equivalence,
            rec.technical_dossier,
            rec.hardware_integration_profile,
            rec.licensing_tags,
            rec.steward_author,
        ),
    )
    conn.commit()
    return fid


if __name__ == "__main__":
    c = connect()
    init_db(c)
    print("Omega Sentinel DB ready at", c.execute("PRAGMA database_list").fetchall())
