from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field
from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, select
from sqlalchemy.orm import Mapped, mapped_column, relationship

from chemvault import Base, utcnow

LIMIAR_ALERTA_HORAS = Decimal("50")


class Equipamento(Base):
    """Unidade da frota: escavadora, motoniveladora ou camião."""

    __tablename__ = "equipamentos_frota"

    id: Mapped[int] = mapped_column(primary_key=True)
    codigo: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    tipo: Mapped[str] = mapped_column(String(64), index=True)
    designacao: Mapped[str] = mapped_column(String(200))
    horimetro: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0"))
    horimetro_ultima_preventiva: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0"))
    intervalo_preventiva: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("250"))
    ciclos: Mapped[int] = mapped_column(default=0)
    estado: Mapped[str] = mapped_column(String(32), default="operacional", index=True)
    agente_mecanico: Mapped[str] = mapped_column(String(120), default="AG-FROTA")
    atualizado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ordens: Mapped[list["OrdemServico"]] = relationship(
        back_populates="equipamento",
        cascade="all, delete-orphan",
    )


class OrdemServico(Base):
    """Ordem preventiva ou corretiva."""

    __tablename__ = "ordens_servico"

    id: Mapped[int] = mapped_column(primary_key=True)
    equipamento_id: Mapped[int] = mapped_column(ForeignKey("equipamentos_frota.id"), index=True)
    tipo: Mapped[str] = mapped_column(String(32))
    estado: Mapped[str] = mapped_column(String(32), default="aberta", index=True)
    descricao: Mapped[str] = mapped_column(Text())
    horimetro_abertura: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    equipamento: Mapped[Equipamento] = relationship(back_populates="ordens")


class HorimetroIn(BaseModel):
    horas: Decimal = Field(gt=0)
    ciclos: int = Field(default=1, ge=0)


class OrdemIn(BaseModel):
    equipamento_id: int
    tipo: str = Field(default="corretiva", max_length=32)
    descricao: str = Field(min_length=1, max_length=2000)


class OrdemOut(BaseModel):
    id: int
    equipamento_id: int
    tipo: str
    estado: str
    descricao: str
    horimetro_abertura: Decimal
    criado_em: datetime

    model_config = {"from_attributes": True}


class EquipamentoOut(BaseModel):
    id: int
    codigo: str
    tipo: str
    designacao: str
    horimetro: Decimal
    horimetro_ultima_preventiva: Decimal
    intervalo_preventiva: Decimal
    horas_ate_preventiva: Decimal
    ciclos: int
    estado: str
    agente_mecanico: str
    atualizado_em: datetime
    ordens: list[OrdemOut]

    model_config = {"from_attributes": True}


class MonitorFrota(BaseModel):
    equipamentos_totais: int
    operacionais: int
    em_alerta: int
    em_manutencao: int
    ordens_abertas: int
    equipamentos: list[EquipamentoOut]


class EquipamentoSeed(BaseModel):
    codigo: str
    tipo: str
    designacao: str
    horimetro: Decimal
    horimetro_ultima_preventiva: Decimal
    intervalo_preventiva: Decimal
    ciclos: int
    agente_mecanico: str


CATALOGO_FROTA: list[EquipamentoSeed] = [
    EquipamentoSeed(
        codigo="EXC-01",
        tipo="escavadora",
        designacao="Escavadora hidráulica 22 t",
        horimetro=Decimal("2450.00"),
        horimetro_ultima_preventiva=Decimal("2300.00"),
        intervalo_preventiva=Decimal("250.00"),
        ciclos=18420,
        agente_mecanico="AG-MEC-EXC",
    ),
    EquipamentoSeed(
        codigo="MOT-01",
        tipo="motoniveladora",
        designacao="Motoniveladora 140",
        horimetro=Decimal("4988.00"),
        horimetro_ultima_preventiva=Decimal("4750.00"),
        intervalo_preventiva=Decimal("250.00"),
        ciclos=22110,
        agente_mecanico="AG-MEC-MOT",
    ),
    EquipamentoSeed(
        codigo="CAM-01",
        tipo="camiao",
        designacao="Camião basculante 8x4",
        horimetro=Decimal("3120.00"),
        horimetro_ultima_preventiva=Decimal("3100.00"),
        intervalo_preventiva=Decimal("200.00"),
        ciclos=9400,
        agente_mecanico="AG-MEC-CAM",
    ),
]


def horas_ate_preventiva(equip: Equipamento) -> Decimal:
    gasto = equip.horimetro - equip.horimetro_ultima_preventiva
    restante = equip.intervalo_preventiva - gasto
    return restante if restante > 0 else Decimal("0")


def recalcular_estado(equip: Equipamento) -> None:
    abertas = [o for o in equip.ordens if o.estado in {"aberta", "em_curso"}]
    corretivas = [o for o in abertas if o.tipo == "corretiva"]
    if corretivas:
        equip.estado = "em_manutencao"
        return
    if horas_ate_preventiva(equip) <= LIMIAR_ALERTA_HORAS:
        equip.estado = "alerta"
        return
    equip.estado = "operacional"


def equipamento_para_out(equip: Equipamento) -> EquipamentoOut:
    return EquipamentoOut(
        id=equip.id,
        codigo=equip.codigo,
        tipo=equip.tipo,
        designacao=equip.designacao,
        horimetro=equip.horimetro,
        horimetro_ultima_preventiva=equip.horimetro_ultima_preventiva,
        intervalo_preventiva=equip.intervalo_preventiva,
        horas_ate_preventiva=horas_ate_preventiva(equip),
        ciclos=equip.ciclos,
        estado=equip.estado,
        agente_mecanico=equip.agente_mecanico,
        atualizado_em=equip.atualizado_em,
        ordens=equip.ordens,
    )


def abrir_preventiva_se_necessario(db, equip: Equipamento) -> OrdemServico | None:
    if horas_ate_preventiva(equip) > LIMIAR_ALERTA_HORAS:
        return None
    aberta = next(
        (o for o in equip.ordens if o.tipo == "preventiva" and o.estado in {"aberta", "em_curso"}),
        None,
    )
    if aberta:
        return None
    ordem = OrdemServico(
        equipamento_id=equip.id,
        tipo="preventiva",
        estado="aberta",
        descricao=f"Preventiva automática — horímetro {equip.horimetro} h",
        horimetro_abertura=equip.horimetro,
        criado_em=utcnow(),
    )
    db.add(ordem)
    equip.ordens.append(ordem)
    return ordem


def persistir_equipamento(db, seed: EquipamentoSeed) -> Equipamento:
    agora = utcnow()
    equip = Equipamento(
        codigo=seed.codigo.upper(),
        tipo=seed.tipo,
        designacao=seed.designacao,
        horimetro=seed.horimetro,
        horimetro_ultima_preventiva=seed.horimetro_ultima_preventiva,
        intervalo_preventiva=seed.intervalo_preventiva,
        ciclos=seed.ciclos,
        agente_mecanico=seed.agente_mecanico,
        atualizado_em=agora,
        estado="operacional",
    )
    db.add(equip)
    db.commit()
    db.refresh(equip)
    abrir_preventiva_se_necessario(db, equip)
    recalcular_estado(equip)
    db.commit()
    db.refresh(equip)
    return equip


def atualizar_horimetro(db, equip: Equipamento, payload: HorimetroIn) -> Equipamento:
    novo = equip.horimetro + payload.horas
    equip.horimetro = novo
    equip.ciclos += payload.ciclos
    equip.atualizado_em = utcnow()
    abrir_preventiva_se_necessario(db, equip)
    recalcular_estado(equip)
    db.commit()
    db.refresh(equip)
    return equip


def abrir_ordem(db, equip: Equipamento, payload: OrdemIn) -> OrdemServico:
    tipo = payload.tipo.strip().lower()
    if tipo not in {"preventiva", "corretiva"}:
        raise ValueError("Tipo de ordem inválido")
    ordem = OrdemServico(
        equipamento_id=equip.id,
        tipo=tipo,
        estado="aberta",
        descricao=payload.descricao.strip(),
        horimetro_abertura=equip.horimetro,
        criado_em=utcnow(),
    )
    db.add(ordem)
    db.commit()
    db.refresh(equip)
    recalcular_estado(equip)
    db.commit()
    db.refresh(ordem)
    return ordem


def consulta_equipamentos():
    return (
        select(Equipamento)
        .order_by(Equipamento.codigo.asc())
    )


def monitor_frota(db) -> MonitorFrota:
    from sqlalchemy.orm import selectinload

    equipamentos = list(
        db.scalars(consulta_equipamentos().options(selectinload(Equipamento.ordens)))
    )
    for equip in equipamentos:
        recalcular_estado(equip)
    db.commit()
    outs = [equipamento_para_out(e) for e in equipamentos]
    return MonitorFrota(
        equipamentos_totais=len(outs),
        operacionais=sum(1 for e in outs if e.estado == "operacional"),
        em_alerta=sum(1 for e in outs if e.estado == "alerta"),
        em_manutencao=sum(1 for e in outs if e.estado == "em_manutencao"),
        ordens_abertas=sum(1 for e in outs for o in e.ordens if o.estado in {"aberta", "em_curso"}),
        equipamentos=outs,
    )
