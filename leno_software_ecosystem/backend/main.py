from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import DateTime, ForeignKey, String, Text, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(exist_ok=True)
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR / 'leno_ecosystem.db'}")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


class Cliente(Base):
    __tablename__ = "clientes"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(200))
    empresa: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(320), unique=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    relatorios: Mapped[list["Relatorio"]] = relationship(back_populates="cliente")


class Relatorio(Base):
    __tablename__ = "relatorios"

    id: Mapped[int] = mapped_column(primary_key=True)
    cliente_id: Mapped[int] = mapped_column(ForeignKey("clientes.id"))
    ativo: Mapped[str] = mapped_column(String(200))
    processo: Mapped[str] = mapped_column(String(200))
    descricao: Mapped[str] = mapped_column(Text())
    observacoes: Mapped[str | None] = mapped_column(Text(), nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    cliente: Mapped[Cliente] = relationship(back_populates="relatorios")


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Leno Software Ecosystem API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3001,http://127.0.0.1:3001").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ClienteIn(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    empresa: str = Field(min_length=1, max_length=200)
    email: EmailStr


class ClienteOut(BaseModel):
    id: int
    nome: str
    empresa: str
    email: str
    criado_em: datetime

    model_config = {"from_attributes": True}


class RelatorioIn(BaseModel):
    cliente_id: int
    ativo: str = Field(min_length=1, max_length=200)
    processo: str = Field(min_length=1, max_length=200)
    descricao: str = Field(min_length=1)
    observacoes: str | None = None


class RelatorioOut(BaseModel):
    id: int
    cliente_id: int
    ativo: str
    processo: str
    descricao: str
    observacoes: str | None
    criado_em: datetime

    model_config = {"from_attributes": True}


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "leno-software-ecosystem"}


@app.get("/api/clientes", response_model=list[ClienteOut])
def listar_clientes(db: Session = Depends(get_db)) -> list[Cliente]:
    return list(db.scalars(select(Cliente).order_by(Cliente.id.desc())))


@app.post("/api/clientes", response_model=ClienteOut, status_code=201)
def criar_cliente(payload: ClienteIn, db: Session = Depends(get_db)) -> Cliente:
    existing = db.scalar(select(Cliente).where(Cliente.email == str(payload.email)))
    if existing:
        raise HTTPException(status_code=409, detail="E-mail já cadastrado")
    cliente = Cliente(
        nome=payload.nome.strip(),
        empresa=payload.empresa.strip(),
        email=str(payload.email).lower(),
        criado_em=utcnow(),
    )
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente


@app.get("/api/relatorios", response_model=list[RelatorioOut])
def listar_relatorios(db: Session = Depends(get_db)) -> list[Relatorio]:
    return list(db.scalars(select(Relatorio).order_by(Relatorio.id.desc())))


@app.post("/api/relatorios", response_model=RelatorioOut, status_code=201)
def criar_relatorio(payload: RelatorioIn, db: Session = Depends(get_db)) -> Relatorio:
    cliente = db.get(Cliente, payload.cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    relatorio = Relatorio(
        cliente_id=payload.cliente_id,
        ativo=payload.ativo.strip(),
        processo=payload.processo.strip(),
        descricao=payload.descricao.strip(),
        observacoes=payload.observacoes.strip() if payload.observacoes else None,
        criado_em=utcnow(),
    )
    db.add(relatorio)
    db.commit()
    db.refresh(relatorio)
    return relatorio
