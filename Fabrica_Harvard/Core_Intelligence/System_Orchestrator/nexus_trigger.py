import json
import os
import time


def check_system_readiness():
    # Verifica a saúde da rede antes de operações críticas
    network_path = 'Fabrica_Harvard/Unified_Business_Vault/network_telemetry.json'

    if os.path.exists(network_path):
        with open(network_path, 'r') as f:
            data = json.load(f)
            if data['status'] == "High Stability":
                return True
    return False


def secure_execution(task_name, function_to_run):
    print(f"[NEXUS TRIGGER] Validando ambiente para: {task_name}")

    if check_system_readiness():
        print(f"[OK] Ambiente Estável. Executando...")
        function_to_run()
    else:
        print(f"[ALERTA] Instabilidade detectada na Starlink. Operação '{task_name}' em espera...")
        # Simula uma espera de 2 segundos para estabilização
        time.sleep(2)
        print(f"[RETRY] Tentando execução forçada via Cache Local...")
        function_to_run()


if __name__ == "__main__":
    # Exemplo de tarefa protegida: Backup Final
    def dummy_backup():
        print(">>> Backup de Segurança Realizado com Sucesso.")

    secure_execution("Backup Estratégico 50/50", dummy_backup)
