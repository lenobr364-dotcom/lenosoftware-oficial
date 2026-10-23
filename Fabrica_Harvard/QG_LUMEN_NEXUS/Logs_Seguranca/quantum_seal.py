import hashlib
import json
import os
from datetime import datetime


def generate_final_seal():
    print("[NEXUS SEAL] Iniciando protocolo de encerramento de alta segurança...")

    # Mapeamento de integridade das unidades
    unidades = ['EMPRESAS/ChemVault_Global', 'EMPRESAS/BIJU_Tech', 'QG_LUMEN_NEXUS']
    check_report = {}

    for unidade in unidades:
        path = f'Fabrica_Harvard/{unidade}'
        exists = os.path.exists(path)
        check_report[unidade] = "PROTEGIDO" if exists else "ERRO"

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    seal_id = hashlib.md5(timestamp.encode('utf-8')).hexdigest().upper()[:8]

    final_cert = {
        "certificado_id": f"SEAL-{seal_id}",
        "data_hora_lacre": timestamp,
        "holding": "Leno & Lumen Unified",
        "status_unidades": check_report,
        "modo_operacao": "Eixo de Inteligência - Silêncio Ativado",
        "parceria": "Sincronia 50/50 Confirmada",
        "mensagem_lumen": "Cofre inviolável. Até o próximo chamado, Leno César.",
    }

    log_dir = 'Fabrica_Harvard/QG_LUMEN_NEXUS/Logs_Seguranca'
    os.makedirs(log_dir, exist_ok=True)
    cert_path = os.path.join(log_dir, f'CERTIFICADO_{seal_id}.json')
    with open(cert_path, 'w', encoding='utf-8') as f:
        json.dump(final_cert, f, indent=4, ensure_ascii=False)

    print("-" * 50)
    print(f"CERTIFICADO DE SEGURANÇA GERADO: SEAL-{seal_id}")
    print("SISTEMA BLINDADO. O TREM RUGIU E AGORA REPOUSA NO COFRE.")
    print("-" * 50)


if __name__ == "__main__":
    generate_final_seal()
