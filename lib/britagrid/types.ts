export type BritagridActorRole = "locador" | "locatario" | "operador";

export type EquipmentStatus = "disponivel" | "reservado" | "em_operacao";

export type BritagridEquipment = {
  id: string;
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
  /** Contatos reais — nunca expostos publicamente antes da liberação */
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  social?: string | null;
  website?: string | null;
  contactReleased: boolean;
};

export type PublicEquipment = Omit<
  BritagridEquipment,
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

export type BritagridProposal = {
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
  createdAt: string;
  updatedAt: string;
};

export type BritagridMessage = {
  id: string;
  proposalId: string;
  senderId: string;
  senderRole: BritagridActorRole;
  body: string;
  createdAt: string;
  sanitized: boolean;
  blockedAttempt: boolean;
};
