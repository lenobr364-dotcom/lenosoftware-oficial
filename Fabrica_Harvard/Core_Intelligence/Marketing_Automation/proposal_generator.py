import json
from datetime import datetime

def generate_partnership_proposal(target_company, region):
    print(f"[MARKETING] Gerando proposta estratégica para: {target_company} ({region})")

    proposal = {
        "titulo": f"Proposta de Licenciamento Estratégico - {target_company}",
        "data": datetime.now().strftime("%d/%m/%Y"),
        "origem": "ChemVault Global & BIJU Técnico",
        "beneficios": [
            "Acesso a formulas químicas exclusivas",
            "Certificação de Conformidade Internacional (ISO/GHS)",
            "Rastreabilidade via QR-Nexus",
            "Redução de custos operacionais em 15%"
        ],
        "modelo_negocio": "Licenciamento sob demanda (Royalties)",
        "assinatura": "Leno César & Lumen Onel - Unified Holding"
    }

    file_path = f"Fabrica_Harvard/Unified_Business_Vault/Proposta_{target_company.replace(' ', '_')}.json"
    with open(file_path, 'w') as f:
        json.dump(proposal, f, indent=4)

    print(f"[MARKETING] Proposta salva e pronta para envio: {file_path}")

if __name__ == "__main__":
    # Gerando proposta para um grande player do setor químico
    generate_partnership_proposal("Global Chemical Alpha", "América do Norte")
