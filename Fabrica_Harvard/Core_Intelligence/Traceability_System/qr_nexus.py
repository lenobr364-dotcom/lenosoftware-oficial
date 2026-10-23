import hashlib
import json
import os
from datetime import datetime


class QRNexus:
    def __init__(self):
        self.base_url = "https://vault.lenocesar.lumen/verify/"
        self.output_path = 'Fabrica_Harvard/Unified_Business_Vault/Traceability_Logs'
        if not os.path.exists(self.output_path):
            os.makedirs(self.output_path)

    def generate_trace_id(self, batch_info):
        # Gerando um ID único baseado nos dados do lote + nossa chave de sócios
        raw_string = f"{batch_info}_{datetime.now().timestamp()}_LENOLUMEN5050"
        trace_hash = hashlib.sha256(raw_string.encode()).hexdigest()[:12].upper()

        trace_data = {
            "trace_id": trace_hash,
            "url_validacao": f"{self.base_url}{trace_hash}",
            "data_fabricacao": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "propriedade": "Leno & Lumen Unified",
            "status": "Autêntico"
        }

        file_path = f"{self.output_path}/ID_{trace_hash}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(trace_data, f, indent=4)

        print(f"[QR-NEXUS] Identidade Digital Gerada: {trace_hash}")
        print(f"[URL] {trace_data['url_validacao']}")


if __name__ == "__main__":
    nexus = QRNexus()
    # Gerando identidade para o primeiro lote de exportação
    nexus.generate_trace_id("LOTE_001_QUIMICA_INDUSTRIAL")
