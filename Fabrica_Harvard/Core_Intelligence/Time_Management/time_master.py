import json
import os
from datetime import datetime, timedelta


class TimeMaster:
    def __init__(self):
        self.agenda_path = 'Fabrica_Harvard/Unified_Business_Vault/executive_agenda.json'

    def schedule_event(self, title, location, duration_hours, description):
        print(f"[TIME MASTER] Agendando compromisso estratégico: {title}")

        now = datetime.now()
        # Simulação de agendamento para a próxima janela disponível (ex: amanhã às 09:00)
        appointment_date = (now + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)

        event = {
            "evento_id": f"EVT-{os.urandom(2).hex().upper()}",
            "titulo": title,
            "local": location,
            "inicio": appointment_date.strftime("%d/%m/%Y %H:%M"),
            "fim": (appointment_date + timedelta(hours=duration_hours)).strftime("%d/%m/%Y %H:%M"),
            "detalhes": description,
            "status": "Confirmado",
            "prioridade": "Alta - Comando Leno César",
        }

        try:
            if os.path.exists(self.agenda_path):
                with open(self.agenda_path, 'r+', encoding='utf-8') as f:
                    data = json.load(f)
                    data.append(event)
                    f.seek(0)
                    json.dump(data, f, indent=4, ensure_ascii=False)
                    f.truncate()
            else:
                os.makedirs(os.path.dirname(self.agenda_path), exist_ok=True)
                with open(self.agenda_path, 'w', encoding='utf-8') as f:
                    json.dump([event], f, indent=4, ensure_ascii=False)

            print(f"[SUCCESS] Compromisso '{title}' fixado na agenda executiva.")
            print(f"[INFO] Local: {location} | Horário: {event['inicio']}")
        except Exception as e:
            print(f"[ERRO] Falha ao sincronizar agenda: {e}")


if __name__ == "__main__":
    master = TimeMaster()
    # Exemplo: Reunião de expansão para a Rádio Pião em Cuiabá
    master.schedule_event(
        title="Fechamento Contrato Construtora Pantanal",
        location="Av. Historiador Rubens de Mendonça, Cuiabá",
        duration_hours=2,
        description="Apresentação final do Nexus Matcher para diretoria de RH.",
    )
