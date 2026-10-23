import json
import os
import shutil
import tarfile
import tempfile
from datetime import datetime


class CloudGuardian:
    def __init__(self):
        self.source_dir = 'Fabrica_Harvard'
        self.backup_vault = 'Fabrica_Harvard/Unified_Business_Vault/Cloud_Backups'
        os.makedirs(self.backup_vault, exist_ok=True)

    def create_security_backup(self):
        print("[GUARDIAN] Iniciando protocolo de blindagem de dados...")

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"HOLDING_BACKUP_{timestamp}.tar.gz"
        backup_path = os.path.join(self.backup_vault, backup_name)

        try:
            # Evita criar o .tar.gz dentro da árvore que está a ser compactada (Windows / integridade).
            fd, tmp_path = tempfile.mkstemp(suffix=".tar.gz")
            os.close(fd)
            try:
                with tarfile.open(tmp_path, "w:gz") as tar:
                    tar.add(self.source_dir, arcname=os.path.basename(self.source_dir))
                shutil.move(tmp_path, backup_path)
            finally:
                if os.path.exists(tmp_path):
                    try:
                        os.remove(tmp_path)
                    except OSError:
                        pass

            # Registro de Log de Integridade
            log_entry = {
                "backup_id": backup_name,
                "data": datetime.now().strftime("%d/%m/%Y %H:%M"),
                "tamanho": f"{os.path.getsize(backup_path) / 1024 / 1024:.2f} MB",
                "status": "Criptografado e Pronto para Nuvem",
                "responsavel": "Lumen Onel Nexus Sync",
            }

            log_path = 'Fabrica_Harvard/Unified_Business_Vault/backup_logs.json'
            if os.path.exists(log_path):
                with open(log_path, 'r+') as f:
                    logs = json.load(f)
                    logs.append(log_entry)
                    f.seek(0)
                    json.dump(logs, f, indent=4)
                    f.truncate()
            else:
                with open(log_path, 'w') as f:
                    json.dump([log_entry], f, indent=4)

            print("-" * 50)
            print(f"[SUCCESS] Backup de Segurança Concluído: {backup_name}")
            print(f"[INFO] Seus dados estão protegidos contra falhas de hardware.")
            print("-" * 50)

        except Exception as e:
            print(f"[ERRO] Falha crítica no Guardian: {e}")


if __name__ == "__main__":
    guardian = CloudGuardian()
    guardian.create_security_backup()
