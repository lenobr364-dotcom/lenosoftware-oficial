export type ComercialActorRole = "locador" | "locatario" | "operador" | "cliente";

export type EquipmentStatus = "disponivel" | "reservado" | "em_operacao" | "operacional" | "alerta" | "em_manutencao";

/**
 * Equipamento do fluxo existente de frota (manutenção) enriquecido
 * para intermediação comercial — não é um marketplace paralelo.
 */
export type ComercialEquipment = {
  id: string;
  /** Código da frota (ex.: EXC-01) */
  codigo: string;
  name: string;
  type: string;
  region: string;
  capacityTph: number;
  hourlyRateBrl: number;
  description: string;
  observations?: string;
  status: EquipmentStatus;
  ownerId: string;
  ownerDisplayName: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  social?: string | null;
  website?: string | null;
  contactReleased: boolean;
};

export type PublicEquipment = Omit<
  ComercialEquipment,
  "phone" | "whatsapp" | "email" | "social" | "website"
> & {
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  social: string | null;
  website: string | null;
  contactReleased: boolean;
};

export type ProposalStatus =
  | "rascunho"
  | "enviada"
  | "aceita"
  | "recusada"
  | "cancelada"
  | "formalizada";

export type ComercialProposal = {
  id: string;
  equipmentId: string;
  equipmentName: string;
  locadorId: string;
  locatarioId: string;
  locatarioDisplayName: string;
  notes: string;
  requestedHours: number;
  estimatedTons: number;
  status: ProposalStatus;
  exclusivityAccepted: boolean;
  exclusivityVersion: string | null;
  exclusivityAcceptedAt: string | null;
  exclusivityActorId: string | null;
  contactReleased: boolean;
  pixPaid: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ComercialMessage = {
  id: string;
  proposalId: string;
  senderId: string;
  senderRole: ComercialActorRole;
  body: string;
  createdAt: string;
  sanitized: boolean;
  blockedAttempt: boolean;
};
