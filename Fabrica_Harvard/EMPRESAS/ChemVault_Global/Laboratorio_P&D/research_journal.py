import json
import os
from datetime import datetime


class ResearchJournal:
    def __init__(self):
        self.journal_path = 'Fabrica_Harvard/EMPRESAS/ChemVault_Global/Laboratorio_P&D/Relatorios/journal_master.json'

    def log_discovery(self, subject, hypothesis, findings, next_steps):
        print(f"[RESEARCH] Documentando avanço técnico: {subject}")

        discovery_entry = {
            "entry_id": f"RES-{os.urandom(2).hex().upper()}",
            "data": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "assunto": subject,
            "hipotese": hypothesis,
            "descobertas_principais": findings,
            "proximos_passos": next_steps,
            "autor": "Leno César",
            "sigilo_holding": "Nível 5 - Máximo",
        }

        try:
            if os.path.exists(self.journal_path):
                with open(self.journal_path, 'r+', encoding='utf-8') as f:
                    data = json.load(f)
                    data.append(discovery_entry)
                    f.seek(0)
                    json.dump(data, f, indent=4, ensure_ascii=False)
                    f.truncate()
            else:
                os.makedirs(os.path.dirname(self.journal_path), exist_ok=True)
                with open(self.journal_path, 'w', encoding='utf-8') as f:
                    json.dump([discovery_entry], f, indent=4, ensure_ascii=False)

            print(f"[SUCCESS] Descoberta sobre '{subject}' imortalizada na Biblioteca Técnica.")
        except Exception as e:
            print(f"[ERRO] Falha ao registrar no Journal: {e}")


if __name__ == "__main__":
    journal = ResearchJournal()
    # Exemplo: Documentando uma melhoria de estabilidade em formulação industrial
    journal.log_discovery(
        subject="Estabilidade térmica de tensoativos em detergente premium",
        hypothesis="Redução de 2°C no pico exotérmico melhora shelf-life sem perda de poder de limpeza.",
        findings="Curvas DSC mostraram janela estável ampliada em 18%; espuma residual dentro da norma BIJU.",
        next_steps="Rodada de ensaios em escala piloto com agitação 1200 RPM e ciclo térmico 15–45°C.",
    )
