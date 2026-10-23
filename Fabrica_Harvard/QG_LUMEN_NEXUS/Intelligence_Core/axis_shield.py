import json
import os
from datetime import datetime


class AxisShield:
    def __init__(self):
        self.config_path = 'Fabrica_Harvard/QG_LUMEN_NEXUS/Comando_Central/system_focus.json'

    def activate_technical_focus(self):
        print("[NEXUS] Ativando Protocolo de Blindagem: Foco em Inteligência e Laboratório.")

        focus_config = {
            "ultima_atualizacao": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "modo_operacao": "Eixo Técnico Prioritário",
            "unidades_em_primeiro_plano": ["ChemVault_Global", "BIJU_Tech", "Laboratorio"],
            "status_radio_piao": "Operação em Segundo Plano (Automático)",
            "alerta_socio": "Ambiente de Desenvolvimento Silenciado para Alta Performance",
        }

        os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
        with open(self.config_path, 'w', encoding='utf-8') as f:
            json.dump(focus_config, f, indent=4, ensure_ascii=False)

        print("-" * 50)
        print("CONCLUÍDO: O sistema agora prioriza o seu espaço de criação.")
        print("FOCO: ChemVault, Biblioteca, Laboratório e QG.")
        print("-" * 50)


if __name__ == "__main__":
    shield = AxisShield()
    shield.activate_technical_focus()
