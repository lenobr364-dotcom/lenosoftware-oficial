import type { ComercialEquipment } from "@/lib/comercial/types";

/**
 * Catálogo alinhado ao fluxo EXISTENTE de frota (`backend/maintenance.py` CATALOGO_FROTA),
 * com campos comerciais e contatos (ocultos até liberação).
 */
export const FROTA_COMERCIAL_SEED: ComercialEquipment[] = [
  {
    id: "eq-exc-01",
    codigo: "EXC-01",
    name: "Escavadora hidráulica 22 t",
    type: "escavadora",
    region: "Barra do Garças — MT",
    capacityTph: 90,
    hourlyRateBrl: 480,
    description:
      "Equipamento EXC-01 da frota Leno.Software. Contato do operador: (66) 99999-1122 ou whatsapp 66999991122 — use apenas o chat intermediado.",
    observations: "OS e propostas só pelo fluxo interno. Evite e-mail direto frota@exemplo-pedreira.com.br.",
    status: "disponivel",
    ownerId: "locador-mt-01",
    ownerDisplayName: "Frota Serra Norte",
    phone: "+55 66 99999-1122",
    whatsapp: "5566999991122",
    email: "frota@exemplo-pedreira.com.br",
    social: "@frotaserranorte",
    website: "https://frota-exemplo.invalid",
    contactReleased: false,
  },
  {
    id: "eq-mot-01",
    codigo: "MOT-01",
    name: "Motoniveladora 140",
    type: "motoniveladora",
    region: "Cuiabá — MT",
    capacityTph: 70,
    hourlyRateBrl: 520,
    description:
      "MOT-01 para terraplanagem. Chame no Instagram @frotacuiaba ou Telegram t.me/frotacuiaba — a plataforma bloqueia esses canais até a liberação.",
    status: "disponivel",
    ownerId: "locador-mt-02",
    ownerDisplayName: "Frota Centro-Oeste",
    phone: "65 98888-4455",
    whatsapp: "5565988884455",
    email: "comercial@frotaco.invalid",
    social: "@frotacuiaba",
    website: "www.frotaco.invalid",
    contactReleased: false,
  },
  {
    id: "eq-cam-01",
    codigo: "CAM-01",
    name: "Camião basculante 8x4",
    type: "camiao",
    region: "Goiânia — GO",
    capacityTph: 40,
    hourlyRateBrl: 310,
    description:
      "CAM-01 para transporte de agregados. Toda negociação deve permanecer no fluxo intermediado Leno.software.",
    status: "disponivel",
    ownerId: "locador-go-01",
    ownerDisplayName: "Frota Goiás Locações",
    phone: null,
    whatsapp: null,
    email: null,
    social: null,
    website: null,
    contactReleased: false,
  },
];
