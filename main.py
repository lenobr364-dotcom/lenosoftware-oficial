import os
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Optional

import flet as ft
import flet.fastapi as flet_fastapi
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI(title="Leno Digital SaaS")

DB_PATH = Path(__file__).resolve().parent / "data" / "leno_saas.db"
REPORTS_DIR = Path(__file__).resolve().parent / "reports"
REPORTS_DIR.mkdir(exist_ok=True)
DB_PATH.parent.mkdir(exist_ok=True)


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            empresa TEXT NOT NULL,
            email TEXT NOT NULL,
            criado_em TEXT NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS relatorios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_id INTEGER NOT NULL,
            ativo TEXT NOT NULL,
            processo TEXT NOT NULL,
            descricao TEXT NOT NULL,
            observacoes TEXT,
            pdf_path TEXT NOT NULL,
            criado_em TEXT NOT NULL,
            FOREIGN KEY (cliente_id) REFERENCES clientes(id)
        )
        """
    )
    conn.commit()
    conn.close()


init_db()


class ClientePayload(BaseModel):
    nome: str
    empresa: str
    email: str


class RelatorioPayload(BaseModel):
    cliente_id: int
    ativo: str
    processo: str
    descricao: str
    observacoes: Optional[str] = None


def salvar_cliente(nome: str, empresa: str, email: str) -> int:
    conn = get_connection()
    cursor = conn.execute(
        "INSERT INTO clientes (nome, empresa, email, criado_em) VALUES (?, ?, ?, ?)",
        (nome, empresa, email, datetime.utcnow().isoformat()),
    )
    conn.commit()
    cliente_id = cursor.lastrowid
    conn.close()
    return cliente_id


def salvar_relatorio(cliente_id: int, ativo: str, processo: str, descricao: str, observacoes: Optional[str]) -> dict:
    report_name = f"relatorio_{cliente_id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.pdf"
    pdf_path = REPORTS_DIR / report_name
    content = gerar_conteudo_relatorio(ativo, processo, descricao, observacoes or "")
    escrever_pdf(content, pdf_path)

    conn = get_connection()
    cursor = conn.execute(
        """
        INSERT INTO relatorios (cliente_id, ativo, processo, descricao, observacoes, pdf_path, criado_em)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (cliente_id, ativo, processo, descricao, observacoes, str(pdf_path), datetime.utcnow().isoformat()),
    )
    conn.commit()
    relatorio_id = cursor.lastrowid
    conn.close()
    return {"id": relatorio_id, "pdf_path": str(pdf_path), "conteudo": content}


def gerar_conteudo_relatorio(ativo: str, processo: str, descricao: str, observacoes: str) -> str:
    return f"""Documento Técnico de Operação
Ativo: {ativo}
Processo: {processo}
Descrição: {descricao}
Observações: {observacoes or 'Sem observações adicionais.'}

Recomendação: revisar rotina de manutenção, registrar inspeções e manter controle documental para reduzir riscos e melhorar compliance.
"""


def escape_pdf(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def escrever_pdf(texto: str, caminho: Path) -> None:
    linhas = texto.splitlines()
    content_stream_lines = []
    y = 760
    for linha in linhas:
        content_stream_lines.append(f"BT /F1 11 Tf 50 {y} Td ({escape_pdf(linha)}) Tj ET")
        y -= 14

    content_stream = "\n".join(content_stream_lines)
    objects = [
        "1 0 obj<< /Type /Catalog /Pages 2 0 R>>endobj",
        "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1>>endobj",
        "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj",
        f"4 0 obj<< /Length {len(content_stream.encode('latin-1'))} >>stream\n{content_stream}\nendstream\nendobj",
        "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj",
    ]
    offsets = []
    pdf = bytearray(b"%PDF-1.4\n")
    offset = len(pdf)
    for obj in objects:
        offsets.append(offset)
        pdf.extend(obj.encode("latin-1"))
        pdf.extend(b"\n")
        offset = len(pdf)

    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
    pdf.extend(b"0000000000 65535 f \n")
    for off in offsets:
        pdf.extend(f"{off:010d} 00000 n \n".encode("latin-1"))
    pdf.extend(f"trailer<< /Size {len(objects) + 1} /Root 1 0 R>>\nstartxref\n{xref_offset}\n%%EOF\n".encode("latin-1"))
    caminho.write_bytes(pdf)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/clientes")
def criar_cliente(payload: ClientePayload) -> dict:
    cliente_id = salvar_cliente(payload.nome, payload.empresa, payload.email)
    return {"cliente_id": cliente_id, "status": "cadastrado"}


@app.post("/api/relatorios")
def criar_relatorio(payload: RelatorioPayload) -> dict:
    return salvar_relatorio(
        cliente_id=payload.cliente_id,
        ativo=payload.ativo,
        processo=payload.processo,
        descricao=payload.descricao,
        observacoes=payload.observacoes,
    )


@app.get("/api/relatorios/{relatorio_id}/download")
def download_relatorio(relatorio_id: int) -> FileResponse:
    conn = get_connection()
    relatorio = conn.execute("SELECT pdf_path FROM relatorios WHERE id = ?", (relatorio_id,)).fetchone()
    conn.close()
    if not relatorio:
        raise HTTPException(status_code=404, detail="Relatório não encontrado")
    caminho = Path(relatorio["pdf_path"])
    if not caminho.exists():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    return FileResponse(path=caminho, filename=caminho.name, media_type="application/pdf")


async def main(page: ft.Page):
    page.title = "Leno Digital SaaS"
    page.bgcolor = "#0a0a0a"
    page.padding = 50
    page.vertical_alignment = ft.MainAxisAlignment.CENTER
    page.horizontal_alignment = ft.CrossAxisAlignment.CENTER

    nome_field = ft.TextField(label="Nome do responsável", width=360, border_radius=12)
    empresa_field = ft.TextField(label="Empresa", width=360, border_radius=12)
    email_field = ft.TextField(label="E-mail", width=360, border_radius=12)
    ativo_field = ft.TextField(label="Ativo / Equipamento", width=360, border_radius=12)
    processo_field = ft.TextField(label="Processo / Manutenção", width=360, border_radius=12)
    descricao_field = ft.TextField(label="Descrição técnica", multiline=True, min_lines=3, max_lines=5, width=360, border_radius=12)
    observacoes_field = ft.TextField(label="Observações", multiline=True, min_lines=2, max_lines=4, width=360, border_radius=12)

    async def gerar_documento(e):
        cliente_id = salvar_cliente(
            nome=nome_field.value or "Cliente sem nome",
            empresa=empresa_field.value or "Empresa não informada",
            email=email_field.value or "sem@email.com",
        )
        relatorio = salvar_relatorio(
            cliente_id=cliente_id,
            ativo=ativo_field.value or "Ativo não informado",
            processo=processo_field.value or "Processo não informado",
            descricao=descricao_field.value or "Descrição técnica não informada",
            observacoes=observacoes_field.value,
        )

        page.controls.clear()
        conteudo = ft.Container(
            content=ft.Column(
                controls=[
                    ft.Text("Documento Técnico Gerado", size=28, color="#D4AF37", weight=ft.FontWeight.BOLD),
                    ft.Text("O fluxo comercial foi concluído com sucesso. O cliente recebeu um documento técnico útil para compliance e manutenção.", size=14, color=ft.colors.WHITE70),
                    ft.Container(
                        content=ft.Column(
                            controls=[
                                ft.Text("Resumo do Relatório", size=18, color=ft.colors.WHITE, weight=ft.FontWeight.W_500),
                                ft.Text(f"Ativo: {ativo_field.value}", color=ft.colors.WHITE),
                                ft.Text(f"Processo: {processo_field.value}", color=ft.colors.WHITE),
                                ft.Text(f"Arquivo PDF: {Path(relatorio['pdf_path']).name}", color=ft.colors.WHITE),
                            ],
                            spacing=6,
                        ),
                        padding=20,
                        border_radius=16,
                        bgcolor=ft.colors.with_opacity(0.06, ft.colors.WHITE),
                        border=ft.border.all(1, ft.colors.with_opacity(0.12, ft.colors.WHITE)),
                    ),
                    ft.Container(
                        content=ft.Column(
                            controls=[
                                ft.Text("Upgrade para o plano de R$ 49/mês", size=18, color="#D4AF37", weight=ft.FontWeight.BOLD),
                                ft.Text("Ative o plano para gerar relatórios recorrentes, histórico e exportações completas.", size=14, color=ft.colors.WHITE70),
                                ft.ElevatedButton(
                                    "Assinar Plano",
                                    bgcolor="#D4AF37",
                                    color=ft.colors.BLACK,
                                    width=220,
                                    style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=14)),
                                ),
                            ],
                            spacing=10,
                        ),
                        padding=20,
                        border_radius=16,
                        bgcolor=ft.colors.with_opacity(0.05, ft.colors.WHITE),
                        border=ft.border.all(1, ft.colors.with_opacity(0.12, ft.colors.WHITE)),
                    ),
                ],
                spacing=16,
                horizontal_alignment=ft.CrossAxisAlignment.START,
            ),
            width=1000,
            padding=30,
            border_radius=24,
            bgcolor=ft.colors.with_opacity(0.05, ft.colors.WHITE),
            blur=ft.Blur(14, 14, ft.BlurTileMode.MIRROR),
            border=ft.border.all(1, ft.colors.with_opacity(0.12, ft.colors.WHITE)),
        )
        await page.add_async(conteudo)
        page.update()

    formulario = ft.Container(
        content=ft.Column(
            controls=[
                ft.Text("Gestão de Processos Químicos e Manutenção", size=28, color="#D4AF37", weight=ft.FontWeight.BOLD),
                ft.Text("Cadastre o ativo, gere um documento técnico e mostre valor imediato ao cliente.", size=14, color=ft.colors.WHITE70),
                nome_field,
                empresa_field,
                email_field,
                ativo_field,
                processo_field,
                descricao_field,
                observacoes_field,
                ft.ElevatedButton(
                    "Gerar Documento Técnico",
                    bgcolor="#D4AF37",
                    color=ft.colors.BLACK,
                    width=280,
                    style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=14)),
                    on_click=gerar_documento,
                ),
            ],
            spacing=10,
            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
        ),
        width=780,
        padding=30,
        border_radius=24,
        bgcolor=ft.colors.with_opacity(0.05, ft.colors.WHITE),
        blur=ft.Blur(14, 14, ft.BlurTileMode.MIRROR),
        border=ft.border.all(1, ft.colors.with_opacity(0.12, ft.colors.WHITE)),
        shadow=ft.BoxShadow(spread_radius=1, blur_radius=20, color=ft.colors.with_opacity(0.6, ft.colors.BLACK)),
    )

    await page.add_async(formulario)


flet_app = flet_fastapi.app(main)
app.mount("/", flet_app)
