import os
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from anti_disintermediation import EXPECTED_LENO_CNPJ, is_expected_leno_cnpj, sanitize_user_input

router = APIRouter(prefix="/api/financeiro", tags=["Financeiro - Leno.Software"])


class PixRequest(BaseModel):
    valor: float
    descricao: str
    cliente_email: str
    accept_exclusivity: bool = Field(
        default=False,
        description="Aceite obrigatório dos termos de exclusividade/comissão Leno.software",
    )
    acknowledge_cnpj: str = Field(
        default="",
        description="CNPJ da Leno.software (36.962.878/0001-55)",
    )
    proposal_id: str | None = None
    release_contacts: bool = False


async def obter_token_santander():
    # Consome as chaves da empresa injetadas no .env
    client_id = os.getenv("SANTANDER_PJ_CLIENT_ID")
    client_secret = os.getenv("SANTANDER_PJ_CLIENT_SECRET")

    if not client_id or not client_secret:
        raise HTTPException(status_code=500, detail="Credenciais Oauth2 do Santander não localizadas no ambiente.")
    # Endpoint oficial Oauth2 (Aqui o httpx fará o POST real em produção)
    # url = "https://trust-sandbox.api.santander.com.br/auth/oauth/v2/token"

    return "lumen_onel_token_autorizado"


@router.post("/gerar-pix")
async def gerar_cobranca_pix(request: PixRequest):
    if not request.accept_exclusivity:
        raise HTTPException(
            status_code=403,
            detail="Aceite os termos de exclusividade/comissão Leno.software antes de gerar o Pix.",
        )
    if not is_expected_leno_cnpj(request.acknowledge_cnpj or EXPECTED_LENO_CNPJ):
        raise HTTPException(
            status_code=400,
            detail=f"Confirme o CNPJ da Leno.software ({EXPECTED_LENO_CNPJ}).",
        )

    token = await obter_token_santander()
    _ = token
    chave_pix_leno = os.getenv("PIX_CHAVE_PRIMARIA", EXPECTED_LENO_CNPJ)
    descricao = sanitize_user_input(request.descricao, "mask").sanitized

    # Estrutura do payload BACEN para a API do Santander
    payload = {
        "calendario": {"expiracao": 3600},
        "devedor": {"cpf": "", "nome": "Cliente"},
        "valor": {"original": f"{request.valor:.2f}"},
        "chave": chave_pix_leno,
        "solicitacaoPagador": descricao,
    }
    _ = payload

    # Mock do retorno da API para visualização imediata no frontend
    return {
        "status": "sucesso",
        "agente_emissor": "Lumen onel",
        "chave_recebedora": chave_pix_leno,
        "cobranca": {
            "valor": request.valor,
            "descricao": descricao,
            "linha_digitavel": f"00020126580014br.gov.bcb.pix0136{chave_pix_leno}5204000053039865802BR5913Leno Software6015Barra do Garcas62070503***6304ABCD",
        },
        "email_cliente_notificado": request.cliente_email,
        "exclusivity_accepted": True,
        "cnpj_acknowledged": EXPECTED_LENO_CNPJ,
        "proposal_id": request.proposal_id,
        "contacts_released": bool(request.release_contacts),
        "timestamp": datetime.now().isoformat(),
    }
