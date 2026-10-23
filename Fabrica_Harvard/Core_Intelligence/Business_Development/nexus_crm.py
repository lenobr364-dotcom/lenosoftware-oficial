import json
import os
from datetime import datetime

class NexusCRM:
    def __init__(self):
        self.crm_path = 'Fabrica_Harvard/Unified_Business_Vault/business_partners.json'

    def register_interaction(self, partner_name, sector, last_talk, next_step):
        print(f"[CRM] Registrando inteligência de mercado: {partner_name}")

        interaction = {
            "parceiro": partner_name,
            "setor": sector, # Ex: Construtora, Distribuidora Quimica, Logística
            "ultima_conversa": last_talk,
            "proximo_passo": next_step,
            "data_registro": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "assinatura_executiva": "Leno César & Lumen Onel"
        }

        try:
            if os.path.exists(self.crm_path):
                with open(self.crm_path, 'r+') as f:
                    data = json.load(f)
                    # Atualiza se o parceiro já existir
                    updated = False
                    for item in data:
                        if item['parceiro'] == partner_name:
                            item.update(interaction)
                            updated = True
                            break
                    if not updated:
                        data.append(interaction)
                    f.seek(0)
                    json.dump(data, f, indent=4)
                    f.truncate()
            else:
                with open(self.crm_path, 'w') as f:
                    json.dump([interaction], f, indent=4)

            print(f"[SUCCESS] Inteligência sobre '{partner_name}' salva no cofre.")
        except Exception as e:
            print(f"[ERRO] Falha ao registrar parceiro: {e}")

if __name__ == "__main__":
    crm = NexusCRM()
    # Exemplo: Prospecção de uma grande construtora para a Rádio Pião
    crm.register_interaction(
        partner_name="Construtora Grande Cuiabá",
        sector="Construção Civil",
        last_talk="Apresentação do Nexus Matcher para RH",
        next_step="Enviar proposta de licenciamento de vagas"
    )
