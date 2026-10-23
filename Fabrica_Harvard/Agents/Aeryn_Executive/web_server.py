import http.server
import os
import socketserver
from pathlib import Path

PORT = 8080
NEXUS_DIR = Path(__file__).resolve().parents[2] / "Nexus_API"
os.chdir(NEXUS_DIR)

Handler = http.server.SimpleHTTPRequestHandler

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"[Aeryn] Lumen Command Center: http://127.0.0.1:{PORT}/")
        httpd.serve_forever()
