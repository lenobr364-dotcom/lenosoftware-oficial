from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field
from sqlalchemy import DateTime, ForeignKey, Numeric, String, select
from sqlalchemy.orm import Mapped, mapped_column, relationship

from agents_factory import AgenteAutonomo, TransacaoInterna
from chemvault import Base, utcnow

LUMEN_CODIGO = "AG-LUMEN-ONEL"
CHEMVAULT_CODIGO = "AG-CHEMVAULT"
MOEDA = "LNC"


class LancamentoRazao(Base):
    """Livro-razão da moeda digital entre agentes."""

    __tablename__ = "livro_razao"

    id: Mapped[int] = mapped_column(primary_key=True)
    origem_id: Mapped[int] = mapped_column(ForeignKey("agentes_autonomos.id"), index=True)
    destino_id: Mapped[int] = mapped_column(ForeignKey("agentes_autonomos.id"), index=True)
    origem_codigo: Mapped[str] = mapped_column(String(64), index=True)
    destino_codigo: Mapped[str] = mapped_column(String(64), index=True)
    tipo: Mapped[str] = mapped_column(String(32), default="transferencia")
    montante: Mapped[Decimal] = mapped_column(Numeric(14, 4))
    custo_computacional: Mapped[Decimal] = mapped_column(Numeric(12, 4), default=Decimal("0"))
    descricao: Mapped[str] = mapped_column(String(400))
    moeda: Mapped[str] = mapped_column(String(8), default=MOEDA)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    origem: Mapped[AgenteAutonomo] = relationship(foreign_keys=[origem_id])
    destino: Mapped[AgenteAutonomo] = relationship(foreign_keys=[destino_id])


class TransferenciaIn(BaseModel):
    origem_codigo: str = Field(default=LUMEN_CODIGO, min_length=1, max_length=64)
    destino_codigo: str = Field(default=CHEMVAULT_CODIGO, min_length=1, max_length=64)
    montante: Decimal = Field(default=Decimal("25.0000"), gt=0)
    custo_computacional: Decimal = Field(default=Decimal("0.2500"), ge=0)
    descricao: str = Field(default="Simulação de transferência interna", max_length=400)


class CarteiraOut(BaseModel):
    agente_id: int
    codigo: str
    nome: str
    saldo: Decimal
    moeda: str = MOEDA


class LancamentoOut(BaseModel):
    id: int
    origem_codigo: str
    destino_codigo: str
    tipo: str
    montante: Decimal
    custo_computacional: Decimal
    descricao: str
    moeda: str
    criado_em: datetime

    model_config = {"from_attributes": True}


class PontoSerie(BaseModel):
    indice: int
    lumen: Decimal
    chemvault: Decimal
    volume: Decimal


class EconomiaMonitor(BaseModel):
    moeda: str = MOEDA
    volume_total: Decimal
    custo_computacional_total: Decimal
    carteiras: list[CarteiraOut]
    lancamentos: list[LancamentoOut]
    serie: list[PontoSerie]


def agente_por_codigo(db, codigo: str) -> AgenteAutonomo | None:
    return db.scalar(select(AgenteAutonomo).where(AgenteAutonomo.codigo == codigo.strip().upper()))


def carteiras(db) -> list[CarteiraOut]:
    agentes = list(db.scalars(select(AgenteAutonomo).order_by(AgenteAutonomo.id.asc())))
    return [
        CarteiraOut(agente_id=a.id, codigo=a.codigo, nome=a.nome, saldo=a.creditos)
        for a in agentes
    ]


def transferir(db, payload: TransferenciaIn) -> LancamentoRazao:
    origem_codigo = payload.origem_codigo.strip().upper()
    destino_codigo = payload.destino_codigo.strip().upper()
    if origem_codigo == destino_codigo:
        raise ValueError("Origem e destino têm de ser distintos")
    origem = agente_por_codigo(db, origem_codigo)
    destino = agente_por_codigo(db, destino_codigo)
    if origem is None or destino is None:
        raise LookupError("Agente de origem ou destino não encontrado")
    total = payload.montante + payload.custo_computacional
    if origem.creditos < total:
        raise ValueError("Saldo insuficiente na carteira de origem")

    agora = utcnow()
    origem.creditos = origem.creditos - total
    destino.creditos = destino.creditos + payload.montante

    lancamento = LancamentoRazao(
        origem_id=origem.id,
        destino_id=destino.id,
        origem_codigo=origem.codigo,
        destino_codigo=destino.codigo,
        tipo="transferencia",
        montante=payload.montante,
        custo_computacional=payload.custo_computacional,
        descricao=payload.descricao.strip(),
        moeda=MOEDA,
        criado_em=agora,
    )
    debito = TransacaoInterna(
        agente_id=origem.id,
        tipo="debito",
        creditos=total,
        custo_computacional=payload.custo_computacional,
        descricao=f"Transferência {MOEDA} → {destino.codigo}",
        criado_em=agora,
    )
    credito = TransacaoInterna(
        agente_id=destino.id,
        tipo="credito",
        creditos=payload.montante,
        custo_computacional=Decimal("0"),
        descricao=f"Recebido {MOEDA} ← {origem.codigo}",
        criado_em=agora,
    )
    db.add_all([lancamento, debito, credito])
    db.commit()
    db.refresh(lancamento)
    return lancamento


def monitor_economia(db) -> EconomiaMonitor:
    lancamentos = list(db.scalars(select(LancamentoRazao).order_by(LancamentoRazao.id.asc())))
    wallets = {c.codigo: c.saldo for c in carteiras(db)}
    replay_lumen = wallets.get(LUMEN_CODIGO, Decimal("0"))
    replay_chem = wallets.get(CHEMVAULT_CODIGO, Decimal("0"))
    for item in reversed(lancamentos):
        if item.origem_codigo == LUMEN_CODIGO:
            replay_lumen += item.montante + item.custo_computacional
        if item.destino_codigo == LUMEN_CODIGO:
            replay_lumen -= item.montante
        if item.origem_codigo == CHEMVAULT_CODIGO:
            replay_chem += item.montante + item.custo_computacional
        if item.destino_codigo == CHEMVAULT_CODIGO:
            replay_chem -= item.montante

    serie: list[PontoSerie] = [
        PontoSerie(indice=0, lumen=replay_lumen, chemvault=replay_chem, volume=Decimal("0"))
    ]
    volume = Decimal("0")
    for index, item in enumerate(lancamentos, start=1):
        if item.origem_codigo == LUMEN_CODIGO:
            replay_lumen -= item.montante + item.custo_computacional
        if item.destino_codigo == LUMEN_CODIGO:
            replay_lumen += item.montante
        if item.origem_codigo == CHEMVAULT_CODIGO:
            replay_chem -= item.montante + item.custo_computacional
        if item.destino_codigo == CHEMVAULT_CODIGO:
            replay_chem += item.montante
        volume += item.montante
        serie.append(
            PontoSerie(indice=index, lumen=replay_lumen, chemvault=replay_chem, volume=volume)
        )

    return EconomiaMonitor(
        volume_total=sum((i.montante for i in lancamentos), start=Decimal("0")),
        custo_computacional_total=sum((i.custo_computacional for i in lancamentos), start=Decimal("0")),
        carteiras=carteiras(db),
        lancamentos=[LancamentoOut.model_validate(i) for i in reversed(lancamentos)],
        serie=serie,
    )
