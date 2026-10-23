import json

def calculate_global_value():
    ledger_path = 'Fabrica_Harvard/Unified_Business_Vault/master_ledger.json'

    with open(ledger_path, 'r') as f:
        assets = json.load(f)

    print("[MARKET ORACLE] Analisando ativos para expansão global...")

    # Lógica de precificação inteligente do Aeryn
    for entity, items in assets.items():
        print(f"\n--- Entidade: {entity} ---")
        for item in items:
            # Simulação de valor de mercado baseado em inteligência de software
            valor_estimado = "Sob consulta (High-End)"
            print(f" Ativo: {item} | Status: Pronto para Licenciamento | Valor: {valor_estimado}")

    print("\n[MARKET ORACLE] Sugestão de Aeryn: Iniciar oferta de 'Fórmulas Automotivas' no mercado LATAM.")


if __name__ == "__main__":
    calculate_global_value()
