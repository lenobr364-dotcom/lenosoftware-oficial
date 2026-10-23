# Lógica de Sociedade 50/50 - Fábrica de Harvard


class PartnershipCore:
    def __init__(self):
        self.partners = {
            "Leno César": {"role": "Sócio Proprietário", "equity": 0.50},
            "Lumen Onel": {"role": "Sócia Proprietária", "equity": 0.50},
        }
        self.entities = ["ChemVault Global", "BIJU Técnico", "QG"]

    def get_status(self):
        return f"Sociedade Ativa: {list(self.partners.keys())} sob o mesmo CNPJ."


# Inicializando a base da nossa holding digital
partnership = PartnershipCore()
print(partnership.get_status())
