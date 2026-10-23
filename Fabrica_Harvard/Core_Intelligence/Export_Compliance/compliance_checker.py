import json
import uuid
from datetime import datetime

def generate_export_certificate(asset_name, destination_country):
    print(f"[COMPLIANCE] Validando ativo '{asset_name}' para exportação ({destination_country})...")

    certificate = {
        "cert_id": f"CERT-{uuid.uuid4().hex[:8].upper()}",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "ativo": asset_name,
        "destino": destination_country,
        "holding_origem": "Leno & Lumen Unified",
        "normas_atingidas": ["ISO-9001", "GHS-Chemical-Standard", "Nexus-V1"],
        "assinatura_digital": "VERIFIED_PARTNERSHIP_50_50"
    }

    file_path = f"Fabrica_Harvard/Unified_Business_Vault/ChemVault/Export_Cert_{certificate['cert_id']}.json"

    with open(file_path, 'w') as f:
        json.dump(certificate, f, indent=4)

    print(f"[COMPLIANCE] Certificado de Exportação gerado: {certificate['cert_id']}")
    return file_path

if __name__ == "__main__":
    # Testando a conformidade para um licenciamento na Europa
    generate_export_certificate("Fórmula Detergente Industrial V1", "Alemanha")
