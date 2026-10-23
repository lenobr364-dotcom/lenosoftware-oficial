"""
Gera index.html (glassmorphism Leno Software) nesta pasta.

Instalação GCP / Vertex (rode uma vez no seu PC, não no CI):
  pip install --upgrade google-cloud-storage google-cloud-aiplatform flet python-dotenv
  gcloud auth application-default login

Upload para bucket (exemplo):
  gsutil cp index.html gs://SEU_BUCKET/index.html
"""
from pathlib import Path

HTML = """<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leno Software | Inovação Industrial</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; color: #f8fafc; background: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; }
        .container { width: 85%; max-width: 800px; padding: 40px; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        h1 { font-size: 3.5rem; margin-bottom: 0.5rem; background: linear-gradient(90deg, #38bdf8, #818cf8); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        h2 { color: #94a3b8; font-weight: 300; margin-bottom: 2rem; letter-spacing: 2px; }
        .grid { display: flex; gap: 20px; margin-top: 2rem; flex-wrap: wrap; justify-content: center; }
        .card { background: rgba(255, 255, 255, 0.03); padding: 20px; border-radius: 16px; flex: 1; min-width: 200px; border: 1px solid rgba(255, 255, 255, 0.05); text-align: left; }
        .card h3 { color: #38bdf8; font-size: 1.1rem; margin-bottom: 10px; }
        .card p { font-size: 0.9rem; color: #94a3b8; line-height: 1.4; }
    </style>
</head>
<body>
    <div class="container">
        <h1>LENO SOFTWARE</h1>
        <h2>Inovação Industrial & IA</h2>
        <p>Transformando o setor de licenciamento químico de Cuiabá para o mundo.</p>
        <div class="grid">
            <div class="card"><h3>ChemVault Global</h3><p>Licenciamento inteligente de fórmulas industriais.</p></div>
            <div class="card"><h3>Omega Sentinel</h3><p>Automação e monitoramento de alta performance.</p></div>
        </div>
    </div>
</body>
</html>
"""

def main() -> None:
    out = Path(__file__).resolve().parent / "index.html"
    out.write_text(HTML, encoding="utf-8")
    print(f"Escrito: {out}")


if __name__ == "__main__":
    main()
