from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field
from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from chemvault import Base, utcnow


class AgenteAutonomo(Base):
    """Agente autónomo da Fábrica de Agentes."""

    __tablename__ = "agentes_autonomos"

    id: Mapped[int] = mapped_column(primary_key=True)
    codigo: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    nome: Mapped[str] = mapped_column(String(200))
    papel: Mapped[str] = mapped_column(String(120))
    estado: Mapped[str] = mapped_column(String(32), default="idle", index=True)
    creditos: Mapped[Decimal] = mapped_column(Numeric(14, 4), default=Decimal("0"))
    custo_processamento: Mapped[Decimal] = mapped_column(Numeric(12, 4), default=Decimal("1"))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    tarefas: Mapped[list["TarefaAgente"]] = relationship(
        back_populates="agente",
        cascade="all, delete-orphan",
    )
    transacoes: Mapped[list["TransacaoInterna"]] = relationship(
        back_populates="agente",
        cascade="all, delete-orphan",
    )


class TarefaAgente(Base):
    """Tarefa atribuída a um agente."""

    __tablename__ = "tarefas_agente"

    id: Mapped[int] = mapped_column(primary_key=True)
    agente_id: Mapped[int] = mapped_column(ForeignKey("agentes_autonomos.id"), index=True)
    titulo: Mapped[str] = mapped_column(String(240))
    descricao: Mapped[str] = mapped_column(Text(), default="")
    estado: Mapped[str] = mapped_column(String(32), default="queued", index=True)
    custo_processamento: Mapped[Decimal] = mapped_column(Numeric(12, 4))
    despachada_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    atualizada_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    agente: Mapped[AgenteAutonomo] = relationship(back_populates="tarefas")


class TransacaoInterna(Base):
    """Registo de créditos e custo computacional interno."""

    __tablename__ = "transacoes_internas"

    id: Mapped[int] = mapped_column(primary_key=True)
    agente_id: Mapped[int] = mapped_column(ForeignKey("agentes_autonomos.id"), index=True)
    tipo: Mapped[str] = mapped_column(String(24))
    creditos: Mapped[Decimal] = mapped_column(Numeric(14, 4))
    custo_computacional: Mapped[Decimal] = mapped_column(Numeric(12, 4))
    descricao: Mapped[str] = mapped_column(String(400))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    agente: Mapped[AgenteAutonomo] = relationship(back_populates="transacoes")


class AgenteIn(BaseModel):
    codigo: str = Field(min_length=1, max_length=64)
    nome: str = Field(min_length=1, max_length=200)
    papel: str = Field(min_length=1, max_length=120)
    creditos: Decimal = Field(default=Decimal("100"), ge=0)
    custo_processamento: Decimal = Field(default=Decimal("1.2500"), ge=0)


class DespachoIn(BaseModel):
    titulo: str = Field(min_length=1, max_length=240)
    descricao: str = Field(default="", max_length=2000)
    custo_processamento: Decimal | None = Field(default=None, ge=0)


class TarefaOut(BaseModel):
    id: int
    agente_id: int
    titulo: str
    descricao: str
    estado: str
    custo_processamento: Decimal
    despachada_em: datetime
    atualizada_em: datetime

    model_config = {"from_attributes": True}


class TransacaoOut(BaseModel):
    id: int
    agente_id: int
    tipo: str
    creditos: Decimal
    custo_computacional: Decimal
    descricao: str
    criado_em: datetime

    model_config = {"from_attributes": True}


class AgenteOut(BaseModel):
    id: int
    codigo: str
    nome: str
    papel: str
    estado: str
    creditos: Decimal
    custo_processamento: Decimal
    criado_em: datetime
    tarefas: list[TarefaOut]
    transacoes: list[TransacaoOut]

    model_config = {"from_attributes": True}


class MonitorFabrica(BaseModel):
    agentes_ativos: int
    agentes_totais: int
    tarefas_em_curso: int
    creditos_em_caixa: Decimal
    creditos_consumidos: Decimal
    custo_computacional_total: Decimal
    agentes: list[AgenteOut]


CATALOGO_AGENTES: list[AgenteIn] = [
    AgenteIn(
        codigo="AG-LUMEN-ONEL",
        nome="Lumen Onel",
        papel="Orquestrador-chefe",
        creditos=Decimal("1000.0000"),
        custo_processamento=Decimal("2.5000"),
    ),
    AgenteIn(
        codigo="AG-CHEMVAULT",
        nome="Steward ChemVault",
        papel="Cofre de formulações",
        creditos=Decimal("500.0000"),
        custo_processamento=Decimal("1.2500"),
    ),
]


def persistir_agente(db, payload: AgenteIn) -> AgenteAutonomo:
    agora = utcnow()
    agente = AgenteAutonomo(
        codigo=payload.codigo.strip().upper(),
        nome=payload.nome.strip(),
        papel=payload.papel.strip(),
        estado="idle",
        creditos=payload.creditos,
        custo_processamento=payload.custo_processamento,
        criado_em=agora,
        transacoes=[
            TransacaoInterna(
                tipo="credito",
                creditos=payload.creditos,
                custo_computacional=Decimal("0"),
                descricao="Dotação inicial de créditos",
                criado_em=agora,
            )
        ],
    )
    db.add(agente)
    db.commit()
    db.refresh(agente)
    return agente


def despachar_tarefa(db, agente: AgenteAutonomo, payload: DespachoIn) -> TarefaAgente:
    agora = utcnow()
    custo = payload.custo_processamento if payload.custo_processamento is not None else agente.custo_processamento
    if agente.creditos < custo:
        raise ValueError("Créditos insuficientes para o despacho")
    agente.creditos = agente.creditos - custo
    agente.estado = "busy"
    tarefa = TarefaAgente(
        agente_id=agente.id,
        titulo=payload.titulo.strip(),
        descricao=payload.descricao.strip(),
        estado="running",
        custo_processamento=custo,
        despachada_em=agora,
        atualizada_em=agora,
    )
    transacao = TransacaoInterna(
        agente_id=agente.id,
        tipo="debito",
        creditos=custo,
        custo_computacional=custo,
        descricao=f"Despacho: {payload.titulo.strip()}",
        criado_em=agora,
    )
    db.add_all([tarefa, transacao])
    db.commit()
    db.refresh(agente)
    db.refresh(tarefa)
    return tarefa
