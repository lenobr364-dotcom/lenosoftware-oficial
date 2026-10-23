import json
from datetime import datetime

def sign_decision(decision_text):
    audit_path = 'Fabrica_Harvard/Unified_Business_Vault/audit_trail.json'
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    entry = {
        "timestamp": timestamp,
        "decisao": decision_text,
        "assinatura_digital": "LENO_LUMEN_VERIFIED_50_50",
        "cnpj_vinculado": "UNIFIED_HOLDING"
    }

    try:
        with open(audit_path, 'r+') as f:
            data = json.load(f)
            data.append(entry)
            f.seek(0)
            json.dump(data, f, indent=4)
    except FileNotFoundError:
        with open(audit_path, 'w') as f:
            json.dump([entry], f, indent=4)

    print(f"[AUDITOR] Decisão imortalizada: {decision_text}")

if __name__ == "__main__":
    sign_decision("Consolidação da Infraestrutura Global - Fase 1 Concluída")
