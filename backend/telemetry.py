from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from time import perf_counter

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import DateTime, Numeric, String, select
from sqlalchemy.orm import Mapped, Session, mapped_column

from chemvault import Base, utcnow

try:
    import psutil
except ImportError:  # pragma: no cover
    psutil = None


class MetricaDesempenho(Base):
    """Amostra de CPU, memória e latência do nó API."""

    __tablename__ = "metricas_desempenho"

    id: Mapped[int] = mapped_column(primary_key=True)
    cpu_percent: Mapped[Decimal] = mapped_column(Numeric(6, 2))
    memoria_percent: Mapped[Decimal] = mapped_column(Numeric(6, 2))
    latencia_ms: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    no_codigo: Mapped[str] = mapped_column(String(64), default="NO-API")
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class LogAuditoria(Base):
    """Trilha de segurança dos agentes e operadores."""

    __tablename__ = "logs_auditoria"

    id: Mapped[int] = mapped_column(primary_key=True)
    ator: Mapped[str] = mapped_column(String(120), index=True)
    acao: Mapped[str] = mapped_column(String(80), index=True)
    recurso: Mapped[str] = mapped_column(String(240))
    origem: Mapped[str] = mapped_column(String(64), default="console")
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class MetricaOut(BaseModel):
    id: int
    cpu_percent: Decimal
    memoria_percent: Decimal
    latencia_ms: Decimal
    no_codigo: str
    criado_em: datetime

    model_config = {"from_attributes": True}


class AuditoriaOut(BaseModel):
    id: int
    ator: str
    acao: str
    recurso: str
    origem: str
    criado_em: datetime

    model_config = {"from_attributes": True}


class NoStatus(BaseModel):
    codigo: str
    papel: str
    estado: str


class TelemetriaMonitor(BaseModel):
    cpu_atual: Decimal
    memoria_atual: Decimal
    latencia_atual: Decimal
    nos: list[NoStatus]
    serie: list[MetricaOut]
    auditoria: list[AuditoriaOut]


def amostrar_sistema() -> tuple[Decimal, Decimal, Decimal]:
    inicio = perf_counter()
    if psutil is None:
        cpu, mem = Decimal("0"), Decimal("0")
    else:
        cpu = Decimal(str(round(psutil.cpu_percent(interval=0.05), 2)))
        mem = Decimal(str(round(psutil.virtual_memory().percent, 2)))
    latencia = Decimal(str(round((perf_counter() - inicio) * 1000, 2)))
    return cpu, mem, latencia


def capturar_metrica(db: Session, no_codigo: str = "NO-API") -> MetricaDesempenho:
    cpu, mem, latencia = amostrar_sistema()
    amostra = MetricaDesempenho(
        cpu_percent=cpu,
        memoria_percent=mem,
        latencia_ms=latencia,
        no_codigo=no_codigo,
        criado_em=utcnow(),
    )
    db.add(amostra)
    db.commit()
    db.refresh(amostra)
    return amostra


def registrar_auditoria(
    db: Session,
    ator: str,
    acao: str,
    recurso: str,
    origem: str = "api",
) -> LogAuditoria:
    log = LogAuditoria(
        ator=ator,
        acao=acao,
        recurso=recurso,
        origem=origem,
        criado_em=utcnow(),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def monitor_telemetria(db: Session) -> TelemetriaMonitor:
    capturar_metrica(db)
    metricas = list(
        db.scalars(select(MetricaDesempenho).order_by(MetricaDesempenho.id.desc()).limit(40))
    )
    metricas.reverse()
    logs = list(db.scalars(select(LogAuditoria).order_by(LogAuditoria.id.desc()).limit(20)))
    atual = metricas[-1] if metricas else None
    nos = [
        NoStatus(codigo="NO-API", papel="FastAPI Leno.Software", estado="online"),
        NoStatus(codigo="NO-AUTH", papel="JWT admin", estado="online"),
        NoStatus(codigo="NO-CHEMVAULT", papel="Cofre de fórmulas", estado="online"),
        NoStatus(codigo="NO-FABRICA", papel="Fábrica de Agentes", estado="online"),
        NoStatus(codigo="NO-LNC", papel="Economia LNC", estado="online"),
        NoStatus(codigo="NO-FROTA", papel="Manutenção", estado="online"),
    ]
    zero = Decimal("0")
    return TelemetriaMonitor(
        cpu_atual=atual.cpu_percent if atual else zero,
        memoria_atual=atual.memoria_percent if atual else zero,
        latencia_atual=atual.latencia_ms if atual else zero,
        nos=nos,
        serie=metricas,
        auditoria=logs,
    )


def montar_router(get_db, require_admin) -> APIRouter:
    router = APIRouter(prefix="/modules/telemetria", tags=["telemetria"])

    @router.get("/monitor", response_model=TelemetriaMonitor)
    def obter_monitor(
        db: Session = Depends(get_db),
        admin: dict = Depends(require_admin),
    ) -> TelemetriaMonitor:
        _ = admin
        return monitor_telemetria(db)

    @router.post("/captura", response_model=MetricaOut, status_code=201)
    def recolher_amostra(
        db: Session = Depends(get_db),
        admin: dict = Depends(require_admin),
    ) -> MetricaDesempenho:
        registrar_auditoria(db, str(admin.get("sub", "admin")), "telemetria.captura", "/captura", "console")
        return capturar_metrica(db)

    @router.get("/auditoria", response_model=list[AuditoriaOut])
    def listar_auditoria(
        db: Session = Depends(get_db),
        admin: dict = Depends(require_admin),
    ) -> list[LogAuditoria]:
        return list(db.scalars(select(LogAuditoria).order_by(LogAuditoria.id.desc()).limit(50)))

    return router
