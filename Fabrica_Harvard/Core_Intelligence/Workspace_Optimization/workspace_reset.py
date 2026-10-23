import os
import shutil
from datetime import datetime


def perform_workspace_reset():
    print("[WORKSPACE] Iniciando protocolo de otimização e arquivamento...")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    archive_dir = f'Fabrica_Harvard/Unified_Business_Vault/Archives/Session_{timestamp}'

    # Criar diretório de arquivo para a sessão de hoje
    os.makedirs(archive_dir, exist_ok=True)

    # Mover logs e relatórios temporários para o arquivo permanente
    source_vault = 'Fabrica_Harvard/Unified_Business_Vault'
    for item in os.listdir(source_vault):
        if item.endswith('.json') and item != 'access_control.json':
            shutil.copy(os.path.join(source_vault, item), os.path.join(archive_dir, item))

    # Limpeza de Cache de Python para manter o notebook rápido
    print("[CLEANUP] Removendo arquivos residuais de compilação (__pycache__)...")
    for root, dirs, files in os.walk('Fabrica_Harvard'):
        if '__pycache__' in dirs:
            shutil.rmtree(os.path.join(root, '__pycache__'))
            dirs.remove('__pycache__')

    print("-" * 50)
    print(f"SESSÃO ARQUIVADA EM: {archive_dir}")
    print("SISTEMA OTIMIZADO: Notebook pronto para alta performance.")
    print("STATUS: Próxima fase aguardando comando do sócio.")
    print("-" * 50)


if __name__ == "__main__":
    perform_workspace_reset()
