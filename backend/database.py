from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Importando o Base da estrutura existente
from chemvault import Base

metadata = Base.metadata

# O banco fica na pasta data, já ignorada pelo git.
DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(exist_ok=True)
SQLALCHEMY_DATABASE_URL = f"sqlite:///{(DATA_DIR / 'lenosoftware.db').as_posix()}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
