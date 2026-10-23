import json
import uuid
from datetime import datetime

def finalize_production_batch(product_name):
    print(f"[FULFILLMENT] Finalizando lote para: {product_name}")

    dispatch_data = {
        "track_id": str(uuid.uuid4())[:8].upper(),
        "data_saida": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "origem": "Fabrica de Harvard / BIJU",
        "licenca_vinculada": "ChemVault-Global-V1",
        "responsaveis": "Leno César & Lumen Onel"
    }

    file_path = f'Fabrica_Harvard/Unified_Business_Vault/BIJU/Dispatch_{dispatch_data["track_id"]}.json'

    with open(file_path, 'w') as f:
        json.dump(dispatch_data, f, indent=4)

    print(f"[FULFILLMENT] Lote despachado! ID de Rastreio: {dispatch_data['track_id']}")

if __name__ == "__main__":
    # Finalizando um lote de teste para o mercado global
    finalize_production_batch("Solucao Industrial High-Performance")
