import type { BritagridEquipment } from "@/lib/britagrid/types";

/**
 * Catálogo demonstrativo de britagem móvel.
 * Contatos reais existem apenas no servidor; a API aplica mascaramento.
 */
export const BRITAGRID_SEED_EQUIPMENT: BritagridEquipment[] = [
  {
    id: "eq-jaw-120",
    name: "Britador de Mandíbulas 1200×800",
    type: "britador_mandibulas",
    region: "Barra do Garças — MT",
    capacityTph: 180,
    hourlyRateBrl: 850,
    description:
      "Conjunto móvel para britagem primária em pedreira e demolição. Produtividade indicativa 180 t/h. Contato do operador: (66) 99999-1122 ou whatsapp 66999991122 — use apenas o chat BritaGrid.",
    observations: "Frete sob consulta. Evite e-mail direto dono@pedreira-exemplo.com.br.",
    status: "disponivel",
    ownerId: "locador-mt-01",
    ownerDisplayName: "Pedreira Serra Norte",
    phone: "+55 66 99999-1122",
    whatsapp: "5566999991122",
    email: "dono@pedreira-exemplo.com.br",
    social: "@pedreiraserra",
    website: "https://pedreira-exemplo.invalid",
    contactReleased: false,
  },
  {
    id: "eq-cone-90",
    name: "Britador Cônico HP 300",
    type: "britador_conico",
    region: "Cuiabá — MT",
    capacityTph: 220,
    hourlyRateBrl: 1100,
    description:
      "Secundário/terciário para brita 0/1. Chame no Instagram @britacuiaba ou Telegram t.me/britacuiaba — a plataforma bloqueia esses canais até a liberação.",
    status: "disponivel",
    ownerId: "locador-mt-02",
    ownerDisplayName: "Brita Centro-Oeste",
    phone: "65 98888-4455",
    whatsapp: "5565988884455",
    email: "comercial@britaco.invalid",
    social: "@britacuiaba",
    website: "www.britaco.invalid",
    contactReleased: false,
  },
  {
    id: "eq-screen-3d",
    name: "Peneira Vibratória Triplo Deck",
    type: "peneira",
    region: "Goiânia — GO",
    capacityTph: 150,
    hourlyRateBrl: 620,
    description:
      "Classificação 3 decks para agregados. Capacidade ~150 t/h. Toda negociação deve permanecer no fluxo BritaGrid Brasil.",
    status: "disponivel",
    ownerId: "locador-go-01",
    ownerDisplayName: "Agregados Goiás Locações",
    phone: null,
    whatsapp: null,
    email: null,
    social: null,
    website: null,
    contactReleased: false,
  },
];
