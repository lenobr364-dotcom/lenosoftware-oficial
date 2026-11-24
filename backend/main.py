from __future__ import annotations

import hmac
import os
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path

import jwt
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from maintenance import (
    CATALOGO_FROTA,
    Equipamento,
    EquipamentoOut,
    HorimetroIn,
    MonitorFrota,
    OrdemIn,
    OrdemOut,
    OrdemServico,
    atualizar_horimetro,
    consulta_equipamentos,
    equipamento_para_out,
    monitor_frota,
    abrir_ordem,
    persistir_equipamento,
)
from economy import (
    CHEMVAULT_CODIGO,
    LUMEN_CODIGO,
    CarteiraOut,
    EconomiaMonitor,
    LancamentoOut,
    LancamentoRazao,
    TransferenciaIn,
    carteiras,
    monitor_economia,
    transferir,
)
from agents_factory import (
    CATALOGO_AGENTES,
    AgenteAutonomo,
    AgenteIn,
    AgenteOut,
    DespachoIn,
    MonitorFabrica,
    TarefaAgente,
    TarefaOut,
    TransacaoInterna,
    despachar_tarefa,
    persistir_agente,
)
from telemetry import montar_router as montar_telemetria, registrar_auditoria
from routers import financeiro
from anti_disintermediation import sanitize_user_input
from chemvault import (
    CATALOGO_INICIAL,
    Base,
    ComponenteFormula,
    FormulaIn,
    FormulaOut,
    FormulaQuimica,
    utcnow,
)
from database import SessionLocal, engine, get_db

load_dotenv(Path(__file__).resolve().parent / ".env")
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Leno.Software API",
    description="Núcleo do ecossistema Leno.Software — gateway para a Fábrica de Agentes e o ChemVault Global.",
    version="0.6.0",
)
app.include_router(financeiro.router)

JWT_SECRET = os.getenv("LENO_JWT_SECRET", "leno-software-local-dev-key-32b!")
JWT_ALG = "HS256"
ADMIN_USER = os.getenv("LENO_ADMIN_USER", "lumen")
ADMIN_PASSWORD = os.getenv("LENO_ADMIN_PASSWORD", "onel-local-dev")
bearer_scheme = HTTPBearer(auto_error=False)


class LoginIn(BaseModel):
    username: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=1, max_length=200)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 28800


def criar_token(sub: str) -> str:
    agora = datetime.now(timezone.utc)
    payload = {
        "sub": sub,
        "role": "admin",
        "iat": int(agora.timestamp()),
        "exp": agora + timedelta(hours=8),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def require_admin(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    if creds is None or not creds.credentials:
        raise HTTPException(status_code=401, detail="Token JWT em falta")
    try:
        return jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="Token JWT inválido") from exc

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001",
    ).split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(montar_telemetria(get_db, require_admin))


def _persistir_formula(db: Session, payload: FormulaIn) -> FormulaQuimica:
    formula = FormulaQuimica(
        codigo=payload.codigo.strip().upper(),
        nome=payload.nome.strip(),
        categoria=payload.categoria.strip(),
        cas_numbers=payload.cas_numbers.strip(),
        proporcao_diluicao=payload.proporcao_diluicao.strip(),
        custo_producao=payload.custo_producao,
        moeda=payload.moeda.strip().upper(),
        unidade_custo=payload.unidade_custo.strip(),
        ativo_principal=payload.ativo_principal.strip() if payload.ativo_principal else None,
        criado_em=utcnow(),
        componentes=[
            ComponenteFormula(
                nome=item.nome.strip(),
                cas_number=item.cas_number.strip(),
                proporcao_percentual=item.proporcao_percentual,
                custo_producao=item.custo_producao,
            )
            for item in payload.componentes
        ],
    )
    db.add(formula)
    db.commit()
    db.refresh(formula)
    return formula


def sincronizar_catalogo() -> None:
    db = SessionLocal()
    try:
        existentes = {codigo for codigo in db.scalars(select(FormulaQuimica.codigo))}
        for item in CATALOGO_INICIAL:
            if item.codigo.upper() in existentes:
                continue
            _persistir_formula(db, item)
    finally:
        db.close()


def _agente_carregado(db: Session, agente_id: int) -> AgenteAutonomo | None:
    return db.scalar(
        select(AgenteAutonomo)
        .options(
            selectinload(AgenteAutonomo.tarefas),
            selectinload(AgenteAutonomo.transacoes),
        )
        .where(AgenteAutonomo.id == agente_id)
    )


def sincronizar_agentes() -> None:
    db = SessionLocal()
    try:
        existentes = {codigo for codigo in db.scalars(select(AgenteAutonomo.codigo))}
        for item in CATALOGO_AGENTES:
            if item.codigo.upper() in existentes:
                continue
            persistir_agente(db, item)
    finally:
        db.close()


def sincronizar_frota() -> None:
    db = SessionLocal()
    try:
        existentes = {codigo for codigo in db.scalars(select(Equipamento.codigo))}
        for item in CATALOGO_FROTA:
            if item.codigo.upper() in existentes:
                continue
            persistir_equipamento(db, item)
    finally:
        db.close()


sincronizar_catalogo()
sincronizar_agentes()
sincronizar_frota()


@app.get("/")
def raiz() -> dict[str, object]:
    return {
        "ecosystem": "Leno.Software",
        "status": "online",
        "lumen": "onel",
        "modules": {
            "fabrica_de_agentes": {
                "status": "online",
                "path": "/modules/fabrica-de-agentes/monitor",
            },
            "chemvault_global": {
                "status": "online",
                "path": "/modules/chemvault-global/formulas",
            },
            "economia": {
                "status": "online",
                "path": "/modules/economia/monitor",
            },
            "manutencao": {
                "status": "online",
                "path": "/modules/manutencao/monitor",
            },
            "telemetria": {
                "status": "online",
                "path": "/modules/telemetria/monitor",
            },
        },
    }


@app.post("/auth/token", response_model=TokenOut)
def emitir_token(payload: LoginIn, db: Session = Depends(get_db)) -> TokenOut:
    user_ok = hmac.compare_digest(
        payload.username.encode("utf-8"),
        ADMIN_USER.encode("utf-8"),
    ) if len(payload.username) == len(ADMIN_USER) else False
    pass_ok = hmac.compare_digest(
        payload.password.encode("utf-8"),
        ADMIN_PASSWORD.encode("utf-8"),
    ) if len(payload.password) == len(ADMIN_PASSWORD) else False
    if not (user_ok and pass_ok):
        registrar_auditoria(db, payload.username, "auth.falha", "/auth/token")
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    registrar_auditoria(db, payload.username, "auth.login", "/auth/token")
    return TokenOut(access_token=criar_token(payload.username))


@app.get("/auth/me")
def sessao_atual(admin: dict = Depends(require_admin)) -> dict[str, object]:
    return {"sub": admin.get("sub"), "role": admin.get("role", "admin")}


@app.get("/modules/chemvault-global/formulas", response_model=list[FormulaOut])
def listar_formulas(db: Session = Depends(get_db)) -> list[FormulaQuimica]:
    consulta = (
        select(FormulaQuimica)
        .options(selectinload(FormulaQuimica.componentes))
        .order_by(FormulaQuimica.id.desc())
    )
    return list(db.scalars(consulta))


@app.post("/modules/chemvault-global/formulas", response_model=FormulaOut, status_code=201)
def registrar_formula(
    payload: FormulaIn,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin),
) -> FormulaQuimica:
    codigo = payload.codigo.strip().upper()
    existente = db.scalar(select(FormulaQuimica).where(FormulaQuimica.codigo == codigo))
    if existente:
        raise HTTPException(status_code=409, detail="Código de fórmula já cadastrado")
    payload = payload.model_copy(update={"codigo": codigo})
    formula = _persistir_formula(db, payload)
    registrar_auditoria(db, str(admin.get("sub")), "admin.formula", codigo)
    return formula


def _consulta_agentes():
    return (
        select(AgenteAutonomo)
        .options(
            selectinload(AgenteAutonomo.tarefas),
            selectinload(AgenteAutonomo.transacoes),
        )
        .order_by(AgenteAutonomo.id.asc())
    )


@app.get("/modules/fabrica-de-agentes/agentes", response_model=list[AgenteOut])
def listar_agentes(db: Session = Depends(get_db)) -> list[AgenteAutonomo]:
    return list(db.scalars(_consulta_agentes()))


@app.post("/modules/fabrica-de-agentes/agentes", response_model=AgenteOut, status_code=201)
def criar_agente(
    payload: AgenteIn,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin),
) -> AgenteAutonomo:
    codigo = payload.codigo.strip().upper()
    existente = db.scalar(select(AgenteAutonomo).where(AgenteAutonomo.codigo == codigo))
    if existente:
        raise HTTPException(status_code=409, detail="Código de agente já cadastrado")
    criado = persistir_agente(db, payload.model_copy(update={"codigo": codigo}))
    carregado = _agente_carregado(db, criado.id)
    if carregado is None:
        raise HTTPException(status_code=500, detail="Falha ao carregar o agente criado")
    registrar_auditoria(db, str(admin.get("sub")), "admin.agente", codigo)
    return carregado


@app.post(
    "/modules/fabrica-de-agentes/agentes/{agente_id}/despacho",
    response_model=TarefaOut,
    status_code=201,
)
def despachar_agente(
    agente_id: int,
    payload: DespachoIn,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin),
) -> TarefaAgente:
    agente = db.get(AgenteAutonomo, agente_id)
    if agente is None:
        raise HTTPException(status_code=404, detail="Agente não encontrado")
    if agente.estado == "offline":
        raise HTTPException(status_code=409, detail="Agente offline")
    try:
        tarefa = despachar_tarefa(db, agente, payload)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    registrar_auditoria(db, str(admin.get("sub")), "admin.despacho", f"agente:{agente_id}")
    return tarefa


@app.get("/modules/fabrica-de-agentes/monitor", response_model=MonitorFabrica)
def monitorizar_fabrica(db: Session = Depends(get_db)) -> MonitorFabrica:
    agentes = list(db.scalars(_consulta_agentes()))
    transacoes = list(db.scalars(select(TransacaoInterna)))
    debitos = [t for t in transacoes if t.tipo == "debito"]
    return MonitorFabrica(
        agentes_ativos=sum(1 for a in agentes if a.estado in {"active", "busy"}),
        agentes_totais=len(agentes),
        tarefas_em_curso=sum(1 for a in agentes for t in a.tarefas if t.estado == "running"),
        creditos_em_caixa=sum((a.creditos for a in agentes), start=Decimal("0")),
        creditos_consumidos=sum((t.creditos for t in debitos), start=Decimal("0")),
        custo_computacional_total=sum((t.custo_computacional for t in debitos), start=Decimal("0")),
        agentes=agentes,
    )


@app.get("/modules/economia/carteiras", response_model=list[CarteiraOut])
def consultar_carteiras(db: Session = Depends(get_db)) -> list[CarteiraOut]:
    return carteiras(db)


@app.get("/modules/economia/razao", response_model=list[LancamentoOut])
def consultar_razao(db: Session = Depends(get_db)) -> list[LancamentoRazao]:
    return list(db.scalars(select(LancamentoRazao).order_by(LancamentoRazao.id.desc())))


@app.get("/modules/economia/monitor", response_model=EconomiaMonitor)
def monitorizar_economia(db: Session = Depends(get_db)) -> EconomiaMonitor:
    return monitor_economia(db)


@app.post("/modules/economia/transferencias", response_model=LancamentoOut, status_code=201)
def simular_transferencia(
    payload: TransferenciaIn,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin),
) -> LancamentoRazao:
    origem = payload.origem_codigo.strip().upper() or LUMEN_CODIGO
    destino = payload.destino_codigo.strip().upper() or CHEMVAULT_CODIGO
    try:
        lancamento = transferir(
            db,
            payload.model_copy(update={"origem_codigo": origem, "destino_codigo": destino}),
        )
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    registrar_auditoria(db, str(admin.get("sub")), "lnc.transferencia", f"{origem}->{destino}")
    return lancamento


@app.get("/modules/manutencao/equipamentos", response_model=list[EquipamentoOut])
def listar_equipamentos(db: Session = Depends(get_db)) -> list[EquipamentoOut]:
    equipamentos = list(
        db.scalars(consulta_equipamentos().options(selectinload(Equipamento.ordens)))
    )
    return [equipamento_para_out(e) for e in equipamentos]


@app.get("/modules/manutencao/monitor", response_model=MonitorFrota)
def monitorizar_frota(db: Session = Depends(get_db)) -> MonitorFrota:
    return monitor_frota(db)


@app.post("/modules/manutencao/equipamentos/{equipamento_id}/horimetro", response_model=EquipamentoOut)
def lancar_horimetro(
    equipamento_id: int,
    payload: HorimetroIn,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin),
) -> EquipamentoOut:
    equip = db.scalar(
        select(Equipamento)
        .options(selectinload(Equipamento.ordens))
        .where(Equipamento.id == equipamento_id)
    )
    if equip is None:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    atualizado = atualizar_horimetro(db, equip, payload)
    db.refresh(atualizado, attribute_names=["ordens"])
    registrar_auditoria(db, str(admin.get("sub")), "admin.horimetro", f"equipamento:{equipamento_id}")
    return equipamento_para_out(atualizado)


@app.post("/modules/manutencao/ordens", response_model=OrdemOut, status_code=201)
def criar_ordem_servico(
    payload: OrdemIn,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin),
) -> OrdemServico:
    equip = db.scalar(
        select(Equipamento)
        .options(selectinload(Equipamento.ordens))
        .where(Equipamento.id == payload.equipamento_id)
    )
    if equip is None:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    sanitized = sanitize_user_input(payload.descricao, "mask")
    if not sanitized.sanitized.strip() and sanitized.blocked:
        raise HTTPException(
            status_code=422,
            detail="Descrição bloqueada: remova telefones, WhatsApp, e-mails, @usuários e links externos.",
        )
    payload = OrdemIn(
        equipamento_id=payload.equipamento_id,
        tipo=payload.tipo,
        descricao=sanitized.sanitized,
    )
    try:
        ordem = abrir_ordem(db, equip, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    registrar_auditoria(db, str(admin.get("sub")), "admin.os", f"equipamento:{payload.equipamento_id}")
    return ordem
