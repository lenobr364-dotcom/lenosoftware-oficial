from __future__ import annotations

import sqlite3
from pathlib import Path

_SCHEMA = Path(__file__).resolve().parent / "schema.sql"


def connect(db_path: str | Path | None = None) -> sqlite3.Connection:
    base = Path(__file__).resolve().parent
    path = Path(db_path) if db_path else base / "omega_sentinel.db"
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    sql = _SCHEMA.read_text(encoding="utf-8")
    conn.executescript(sql)
    conn.commit()
