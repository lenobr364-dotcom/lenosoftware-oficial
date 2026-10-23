import json
import os
from datetime import datetime

def generate_business_proposal(client_name, service_type, value_estimate):
    print(f"[PROPOSAL ENGINE] Gerando proposta técnica para: {client_name}")

    proposal_content = {
        "identificacao": f"PROP-{os.urandom(2).hex().upper()}",
        "emissor": "Leno & Lumen Unified Holding",
        "cliente": client_name,
        "escopo": service_type, # Ex: Licenciamento de Fórmulas, Recrutamento Rádio Pião
        "valor_investimento": f"R$ {value_estimate:,.2f}",
        "validade": "15 dias",
        "data_emissao": datetime.now().strftime("%d/%m/%Y"),
        "termos": "Parceria estratégica 50/50 com suporte técnico especializado.",
        "status_documento": "Minuta Gerada - Aguardando Revisão de Leno César"
    }

    file_name = f"Fabrica_Harvard/Unified_Business_Vault/PROPOSTA_{client_name.replace(' ', '_')}.json"

    with open(file_name, 'w') as f:
        json.dump(proposal_content, f, indent=4)

    print(f"[SUCCESS] Proposta comercial pronta para envio em: {file_name}")

if __name__ == "__main__":
    # Exemplo: Gerando uma proposta de licenciamento para a ChemVault
    generate_business_proposal(
        client_name="Indústria Química Pantanal",
        service_type="Licenciamento de Fórmulas de Detergentes Premium",
        value_estimate=15500.00
    )
