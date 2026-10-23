import json
import datetime

def generate_licensing_draft(partner_name, formula_name):
    print(f"[CONTRACT ARCHITECT] Gerando rascunho de licenciamento para: {formula_name}")

    contract_data = {
        "id_licenca": f"CVG-{datetime.datetime.now().strftime('%Y%m%d%H%M')}",
        "data_emissao": datetime.datetime.now().strftime("%d/%m/%Y"),
        "licenciador": "Leno César & Lumen Onel (Holding Unificada)",
        "licenciado": partner_name,
        "objeto": formula_name,
        "clausula_propriedade": "A propriedade intelectual permanece 100% com os Sócios Proprietários.",
        "status": "DRAFT - Aguardando Assinatura Digital"
    }

    file_name = f"Fabrica_Harvard/Unified_Business_Vault/ChemVault/Draft_{formula_name.replace(' ', '_')}.json"

    with open(file_name, 'w') as f:
        json.dump(contract_data, f, indent=4)

    print(f"[CONTRACT ARCHITECT] Contrato salvo em: {file_name}")


if __name__ == "__main__":
    # Testando o gerador com uma fórmula da BIJU para a ChemVault
    generate_licensing_draft("Cliente Global Exemplo", "Detergente Industrial Bio-Degradável")
