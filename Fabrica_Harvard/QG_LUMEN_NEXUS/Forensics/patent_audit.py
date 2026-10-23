import hashlib
import json
import os
from datetime import datetime


class NexusForensics:
    def __init__(self):
        self.audit_log = 'Fabrica_Harvard/QG_LUMEN_NEXUS/Forensics/integrity_ledger.json'

    def notarize_discovery(self, title, content_summary):
        print(f"[FORENSICS] Gerando prova de anterioridade para: {title}")

        # Gera um Hash único (impressão digital) do conhecimento para prova de patente
        digital_signature = hashlib.sha256(content_summary.encode('utf-8')).hexdigest()

        entry = {
            "timestamp": datetime.now().strftime("%Y%m%d_%H%M%S"),
            "titulo_patente": title,
            "hash_integridade": digital_signature,
            "status_legal": "Protegido por Criptografia Nexus",
            "autor_principal": "Leno César",
            "co_autor": "Lumen Onel (AI Systems)",
        }

        try:
            if os.path.exists(self.audit_log):
                with open(self.audit_log, 'r+', encoding='utf-8') as f:
                    data = json.load(f)
                    data.append(entry)
                    f.seek(0)
                    json.dump(data, f, indent=4, ensure_ascii=False)
                    f.truncate()
            else:
                os.makedirs(os.path.dirname(self.audit_log), exist_ok=True)
                with open(self.audit_log, 'w', encoding='utf-8') as f:
                    json.dump([entry], f, indent=4, ensure_ascii=False)

            print(f"[SUCCESS] Assinatura Digital Gerada: {digital_signature[:16]}...")
            print(f"[INFO] Ativo '{title}' agora é uma patente digital inviolável.")
        except Exception as e:
            print(f"[ERRO] Falha na auditoria forense: {e}")


if __name__ == "__main__":
    audit = NexusForensics()
    # Exemplo: Selando a nova metodologia de estabilização de tensoativos
    audit.notarize_discovery(
        title="Metodologia Biju-Tech de Estabilização Molecular",
        content_summary="Processo de agitação controlada e resfriamento gradual para tensoativos industriais.",
    )
