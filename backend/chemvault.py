from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal

from pydantic import BaseModel, Field
from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base ORM do ecossistema Leno.Software."""


class FormulaQuimica(Base):
    """Cadastro industrial de formulação (ChemVault Global)."""

    __tablename__ = "formulas_quimicas"

    id: Mapped[int] = mapped_column(primary_key=True)
    codigo: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    nome: Mapped[str] = mapped_column(String(200), index=True)
    categoria: Mapped[str] = mapped_column(String(120))
    cas_numbers: Mapped[str] = mapped_column(String(400))
    proporcao_diluicao: Mapped[str] = mapped_column(Text())
    custo_producao: Mapped[Decimal] = mapped_column(Numeric(12, 4))
    moeda: Mapped[str] = mapped_column(String(8), default="BRL")
    unidade_custo: Mapped[str] = mapped_column(String(32), default="BRL/L")
    ativo_principal: Mapped[str | None] = mapped_column(String(200), nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    componentes: Mapped[list["ComponenteFormula"]] = relationship(
        back_populates="formula",
        cascade="all, delete-orphan",
    )


class ComponenteFormula(Base):
    """Componente com CAS, proporção e custo de produção."""

    __tablename__ = "componentes_formula"

    id: Mapped[int] = mapped_column(primary_key=True)
    formula_id: Mapped[int] = mapped_column(ForeignKey("formulas_quimicas.id"))
    nome: Mapped[str] = mapped_column(String(200))
    cas_number: Mapped[str] = mapped_column(String(32))
    proporcao_percentual: Mapped[Decimal] = mapped_column(Numeric(8, 4))
    custo_producao: Mapped[Decimal] = mapped_column(Numeric(12, 4))
    formula: Mapped[FormulaQuimica] = relationship(back_populates="componentes")


class ComponenteIn(BaseModel):
    nome: str = Field(min_length=1, max_length=200)
    cas_number: str = Field(min_length=1, max_length=32)
    proporcao_percentual: Decimal = Field(ge=0, le=100)
    custo_producao: Decimal = Field(ge=0)


class ComponenteOut(ComponenteIn):
    id: int

    model_config = {"from_attributes": True}


class FormulaIn(BaseModel):
    codigo: str = Field(min_length=1, max_length=64)
    nome: str = Field(min_length=1, max_length=200)
    categoria: str = Field(min_length=1, max_length=120)
    cas_numbers: str = Field(min_length=1, max_length=400)
    proporcao_diluicao: str = Field(min_length=1)
    custo_producao: Decimal = Field(ge=0)
    moeda: str = Field(default="BRL", max_length=8)
    unidade_custo: str = Field(default="BRL/L", max_length=32)
    ativo_principal: str | None = Field(default=None, max_length=200)
    componentes: list[ComponenteIn] = Field(default_factory=list)


class FormulaOut(BaseModel):
    id: int
    codigo: str
    nome: str
    categoria: str
    cas_numbers: str
    proporcao_diluicao: str
    custo_producao: Decimal
    moeda: str
    unidade_custo: str
    ativo_principal: str | None
    criado_em: datetime
    componentes: list[ComponenteOut]

    model_config = {"from_attributes": True}


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


CATALOGO_INICIAL: list[FormulaIn] = [
    FormulaIn(
        codigo="CV-ARLA-32",
        nome="ARLA 32 (solução aquosa de ureia 32,5%)",
        categoria="Linha Automotiva",
        cas_numbers="57-13-6, 7732-18-5",
        proporcao_diluicao="Pronto para uso — ISO 22241 / DIN 70070; não diluir fora da especificação SCR.",
        custo_producao=Decimal("3.8500"),
        ativo_principal="Ureia automotiva grau A",
        componentes=[
            ComponenteIn(
                nome="Ureia",
                cas_number="57-13-6",
                proporcao_percentual=Decimal("32.5000"),
                custo_producao=Decimal("2.4000"),
            ),
            ComponenteIn(
                nome="Água desmineralizada",
                cas_number="7732-18-5",
                proporcao_percentual=Decimal("67.5000"),
                custo_producao=Decimal("0.0500"),
            ),
        ],
    ),
    FormulaIn(
        codigo="CV-SOLUPAN",
        nome="Solupan Alcalino Forte",
        categoria="Linha Automotiva",
        cas_numbers="7732-18-5, 1310-73-2, 27176-87-0",
        proporcao_diluicao="5 litros para 200 litros de água.",
        custo_producao=Decimal("4.5000"),
        ativo_principal="Base desengraxante alcalina",
        componentes=[
            ComponenteIn(
                nome="Água",
                cas_number="7732-18-5",
                proporcao_percentual=Decimal("75.0000"),
                custo_producao=Decimal("0.0500"),
            ),
            ComponenteIn(
                nome="Hidróxido de sódio",
                cas_number="1310-73-2",
                proporcao_percentual=Decimal("19.0000"),
                custo_producao=Decimal("1.8000"),
            ),
            ComponenteIn(
                nome="Ácido dodecilbenzenossulfônico",
                cas_number="27176-87-0",
                proporcao_percentual=Decimal("1.0000"),
                custo_producao=Decimal("1.8500"),
            ),
        ],
    ),
]
