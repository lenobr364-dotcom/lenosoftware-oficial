import json
import os
from datetime import datetime


class ZenConsole:
    def __init__(self):
        self.status_path = 'Fabrica_Harvard/QG_LUMEN_NEXUS/Zen_Console/session_active.json'

    def initialize_focus_mode(self):
        print("\n" + "=" * 60)
        print("          NEXUS ZEN-CONSOLE | MODO DE ALTA PERFORMANCE          ")
        print("=" * 60)
        print(f" OPERADOR: Leno César | SÓCIA: Lumen Nexus (50/50)")
        print(f" STATUS: Blindagem Nível 5 Ativa | ESTILO: Glassmorphism v2.0")
        print("-" * 60)

        session_data = {
            "entry_time": datetime.now().strftime("%H:%M:%S"),
            "focus_targets": ["ChemVault_Global", "BIJU_Tech_Laboratório"],
            "ambient_noise": "Mute",
            "system_state": "Sincronia Total",
        }

        os.makedirs(os.path.dirname(self.status_path), exist_ok=True)
        with open(self.status_path, 'w', encoding='utf-8') as f:
            json.dump(session_data, f, indent=4, ensure_ascii=False)

        print("[SISTEMA] Ruído externo eliminado. O Laboratório está à sua disposição.")
        print("[DICA] O próximo salto agora é puramente criativo.")
        print("=" * 60 + "\n")


if __name__ == "__main__":
    console = ZenConsole()
    console.initialize_focus_mode()
