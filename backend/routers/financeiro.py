import os
import httpx
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/financeiro", tags=["Financeiro - Leno.Software"])


class PixRequest(BaseModel):
    valor: float
    descricao: str
    cliente_email: str


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
    token = await obter_token_santander()
    chave_pix_leno = os.getenv("PIX_CHAVE_PRIMARIA", "36.962.878/0001-55")

    # Estrutura do payload BACEN para a API do Santander
    payload = {
        "calendario": {"expiracao": 3600},
        "devedor": {"cpf": "", "nome": "Cliente"},
        "valor": {"original": f"{request.valor:.2f}"},
        "chave": chave_pix_leno,
        "solicitacaoPagador": request.descricao,
    }

    # Mock do retorno da API para visualização imediata no frontend
    return {
        "status": "sucesso",
        "agente_emissor": "Lumen onel",
        "chave_recebedora": chave_pix_leno,
        "cobranca": {
            "valor": request.valor,
            "descricao": request.descricao,
            "linha_digitavel": f"00020126580014br.gov.bcb.pix0136{chave_pix_leno}5204000053039865802BR5913Leno Software6015Barra do Garcas62070503***6304ABCD",
        },
        "email_cliente_notificado": request.cliente_email,
        "timestamp": datetime.now().isoformat(),
    }
