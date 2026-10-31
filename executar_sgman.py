import time
import os
import pandas as pd
from playwright.sync_api import sync_playwright

def texto(valor):
    if pd.isna(valor):
        return ""
    texto_valor = str(valor).strip()
    if texto_valor.endswith(".0"):
        texto_valor = texto_valor[:-2]
    return texto_valor

def run_lumen_sgman_cadastro():
    print("[LUMEN ONEL] A iniciar protocolo de cadastro de peças no SGMAN...")
    arquivo_planilha = r"C:\Users\Leno\Documents\automacao sgman.py\PLANILHA ESTOQUE.xlsx"
    try:
        df = pd.read_excel(arquivo_planilha, sheet_name="ESTOQUE", header=5)
        df = df.dropna(subset=["MATERIAIS"])
        print(f"[LUMEN] Planilha carregada com sucesso. Total de registos: {len(df)}")
    except Exception as e:
        print(f"[LUMEN] Erro ao carregar a planilha: {e}")
        return
    user_data_dir = os.path.join(os.getcwd(), "playwright_profile")
    with sync_playwright() as p:
        # Contexto persistente para manter a sessão/login ativos
        browser_context = p.chromium.launch_persistent_context(
            user_data_dir=user_data_dir,
            headless=False,
            no_viewport=True,
            args=["--start-maximized"]
        )

        page = browser_context.pages[0] if browser_context.pages else browser_context.new_page()
        # Acede ao SGMAN da Rocha Mineração
        page.goto("https://sgman.com.br/rochamineracao")
        print("[LUMEN] A aceder ao SGMAN. Faça o login e abra a tela de cadastro de peças.")
        print("[LUMEN] Aguardando 35 segundos...")
        time.sleep(35)
        # Loop para iterar sobre cada linha da planilha e preencher o formulário
        for index, row in df.iterrows():
            try:
                codigo = texto(row.get("CÓDIGO INTERNO ROCHA", ""))
                descricao = texto(row.get("MATERIAIS", ""))
                observacoes = texto(row.get("Descrição Longa do Material (Especificações Técnicas)", ""))
                if not observacoes:
                    observacoes = texto(row.get("APLICAÇÃO", ""))
                if not descricao:
                    continue
                print(f"[LUMEN] A processar o item {index + 1}/{len(df)}: {codigo or 'sem código'} - {descricao}")

                # 2. Cód. Interno
                if codigo:
                    page.fill("input[formcontrolname='codigo_interno'], input#codigo_interno, div.tab-pane input:nth-of-type(2)", codigo)
                # 4. Descrição
                page.fill("textarea", descricao)
                # 5. Observações
                if observacoes:
                    page.fill("div.tab-pane textarea:nth-of-type(2)", observacoes)
                # 6. Clica no botão azul 'Confirmar' para submeter o registo atual
                print("[LUMEN] A submeter o formulário...")
                page.click("button:has-text('Confirmar')")

                time.sleep(2)
            except Exception as item_error:
                print(f"[LUMEN] Erro ao processar a linha {index}: {item_error}")
        print("[LUMEN] Ciclo de cadastro de peças concluído com sucesso!")
        time.sleep(5)
        browser_context.close()
if __name__ == "__main__":
    run_lumen_sgman_cadastro()
