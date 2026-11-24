import {
  EXPECTED_LENO_CNPJ,
  LENO_EXCLUSIVITY_VERSION,
  isExpectedLenoCnpj,
  type ExclusivityAcceptanceRecord,
} from "@/lib/anti-disintermediation/exclusivity-terms";
import {
  maskContactText,
  maskPublicContactFields,
  sanitizeUserInput,
} from "@/lib/anti-disintermediation/contact-sanitize";
import { FROTA_COMERCIAL_SEED } from "@/lib/comercial/catalog";
import type {
  ComercialEquipment,
  ComercialMessage,
  ComercialProposal,
  PublicEquipment,
} from "@/lib/comercial/types";

type StoreShape = {
  equipment: ComercialEquipment[];
  proposals: ComercialProposal[];
  messages: ComercialMessage[];
  exclusivityLog: ExclusivityAcceptanceRecord[];
};

const globalForComercial = globalThis as unknown as {
  __lenoComercialStore?: StoreShape;
};

function createStore(): StoreShape {
  return {
    equipment: FROTA_COMERCIAL_SEED.map((e) => ({ ...e })),
    proposals: [],
    messages: [],
    exclusivityLog: [],
  };
}

function store(): StoreShape {
  if (!globalForComercial.__lenoComercialStore) {
    globalForComercial.__lenoComercialStore = createStore();
  }
  return globalForComercial.__lenoComercialStore;
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function toPublicEquipment(eq: ComercialEquipment): PublicEquipment {
  const maskedFields = maskPublicContactFields(
    {
      phone: eq.phone,
      whatsapp: eq.whatsapp,
      email: eq.email,
      social: eq.social,
      website: eq.website,
    },
    eq.contactReleased,
  );

  const description = eq.contactReleased
    ? eq.description
    : maskContactText(eq.description).sanitized;
  const observations =
    eq.observations == null
      ? undefined
      : eq.contactReleased
        ? eq.observations
        : maskContactText(eq.observations).sanitized;

  return {
    id: eq.id,
    codigo: eq.codigo,
    name: eq.name,
    type: eq.type,
    region: eq.region,
    capacityTph: eq.capacityTph,
    hourlyRateBrl: eq.hourlyRateBrl,
    description,
    observations,
    status: eq.status,
    ownerId: eq.ownerId,
    ownerDisplayName: eq.ownerDisplayName,
    phone: maskedFields.phone ?? null,
    whatsapp: maskedFields.whatsapp ?? null,
    email: maskedFields.email ?? null,
    social: maskedFields.social ?? null,
    website: maskedFields.website ?? null,
    contactReleased: eq.contactReleased,
  };
}

export function listPublicEquipment(): PublicEquipment[] {
  return store().equipment.map(toPublicEquipment);
}

export function getPublicEquipment(id: string): PublicEquipment | null {
  const eq = store().equipment.find((e) => e.id === id);
  return eq ? toPublicEquipment(eq) : null;
}

export function getEquipmentRaw(id: string): ComercialEquipment | null {
  return store().equipment.find((e) => e.id === id) ?? null;
}

export type CreateProposalInput = {
  equipmentId: string;
  locatarioId: string;
  locatarioDisplayName: string;
  notes: string;
  requestedHours: number;
  estimatedTons: number;
};

export function createProposal(input: CreateProposalInput):
  | { ok: true; proposal: ComercialProposal; notesSanitized: boolean }
  | { ok: false; error: string; message: string } {
  const eq = getEquipmentRaw(input.equipmentId);
  if (!eq) {
    return { ok: false, error: "equipment_not_found", message: "Equipamento não encontrado." };
  }

  const notesResult = sanitizeUserInput(input.notes ?? "", "mask");
  const now = new Date().toISOString();
  const proposal: ComercialProposal = {
    id: newId("prop"),
    equipmentId: eq.id,
    equipmentName: eq.name,
    locadorId: eq.ownerId,
    locatarioId: input.locatarioId,
    locatarioDisplayName: input.locatarioDisplayName.trim() || "Locatário",
    notes: notesResult.sanitized,
    requestedHours: Math.max(1, Number(input.requestedHours) || 1),
    estimatedTons: Math.max(0, Number(input.estimatedTons) || 0),
    status: "enviada",
    exclusivityAccepted: false,
    exclusivityVersion: null,
    exclusivityAcceptedAt: null,
    exclusivityActorId: null,
    contactReleased: false,
    pixPaid: false,
    createdAt: now,
    updatedAt: now,
  };
  store().proposals.unshift(proposal);
  return { ok: true, proposal: publicProposal(proposal), notesSanitized: notesResult.changed };
}

function publicProposal(p: ComercialProposal): ComercialProposal {
  return {
    ...p,
    notes: p.contactReleased ? p.notes : maskContactText(p.notes).sanitized,
  };
}

export function listProposals(): ComercialProposal[] {
  return store().proposals.map(publicProposal);
}

export function getProposal(id: string): ComercialProposal | null {
  const p = store().proposals.find((x) => x.id === id);
  return p ? publicProposal(p) : null;
}

export type AcceptProposalInput = {
  proposalId: string;
  actorId: string;
  actorRole: "locador" | "locatario" | "operador" | "cliente";
  acceptExclusivity: boolean;
  acknowledgeCnpj: string;
};

export function acceptProposal(input: AcceptProposalInput):
  | { ok: true; proposal: ComercialProposal; exclusivity: ExclusivityAcceptanceRecord }
  | { ok: false; error: string; message: string } {
  const raw = store().proposals.find((x) => x.id === input.proposalId);
  if (!raw) {
    return { ok: false, error: "proposal_not_found", message: "Proposta não encontrada." };
  }
  if (!input.acceptExclusivity) {
    return {
      ok: false,
      error: "exclusivity_required",
      message:
        "É obrigatório aceitar os termos de exclusividade e comissão da Leno.software para formalizar a proposta.",
    };
  }
  if (!isExpectedLenoCnpj(input.acknowledgeCnpj)) {
    return {
      ok: false,
      error: "cnpj_mismatch",
      message: `Confirme o CNPJ da Leno.software (${EXPECTED_LENO_CNPJ}) para registrar o aceite.`,
    };
  }

  const now = new Date().toISOString();
  const record: ExclusivityAcceptanceRecord = {
    accepted: true,
    version: LENO_EXCLUSIVITY_VERSION,
    acceptedAt: now,
    actorId: input.actorId,
    actorRole: input.actorRole,
    proposalId: raw.id,
    cnpjAcknowledged: EXPECTED_LENO_CNPJ,
  };

  raw.status = "aceita";
  raw.exclusivityAccepted = true;
  raw.exclusivityVersion = LENO_EXCLUSIVITY_VERSION;
  raw.exclusivityAcceptedAt = now;
  raw.exclusivityActorId = input.actorId;
  raw.updatedAt = now;
  store().exclusivityLog.push(record);

  return { ok: true, proposal: publicProposal(raw), exclusivity: record };
}

/**
 * Liberação após formalização / pagamento Pix —
 * revela contatos apenas para aquela proposta/equipamento.
 */
export function formalizeAndReleaseContacts(proposalId: string):
  | { ok: true; proposal: ComercialProposal; equipment: PublicEquipment }
  | { ok: false; error: string; message: string } {
  const raw = store().proposals.find((x) => x.id === proposalId);
  if (!raw) {
    return { ok: false, error: "proposal_not_found", message: "Proposta não encontrada." };
  }
  if (!raw.exclusivityAccepted) {
    return {
      ok: false,
      error: "exclusivity_required",
      message: "Aceite de exclusividade necessário antes da liberação de contatos.",
    };
  }
  raw.status = "formalizada";
  raw.contactReleased = true;
  raw.pixPaid = true;
  raw.updatedAt = new Date().toISOString();

  const eq = store().equipment.find((e) => e.id === raw.equipmentId);
  if (eq) {
    eq.contactReleased = true;
    eq.status = "reservado";
  }

  return {
    ok: true,
    proposal: publicProposal(raw),
    equipment: eq ? toPublicEquipment(eq) : (null as unknown as PublicEquipment),
  };
}

export type PostMessageInput = {
  proposalId: string;
  senderId: string;
  senderRole: "locador" | "locatario" | "operador" | "cliente";
  body: string;
};

export function postMessage(input: PostMessageInput):
  | { ok: true; message: ComercialMessage }
  | { ok: false; error: string; message: string } {
  const proposal = store().proposals.find((p) => p.id === input.proposalId);
  if (!proposal) {
    return { ok: false, error: "proposal_not_found", message: "Proposta não encontrada." };
  }

  const result = sanitizeUserInput(input.body ?? "", "mask");
  if (!result.sanitized.trim() && result.blocked) {
    return {
      ok: false,
      error: "contact_blocked",
      message:
        "Mensagem bloqueada: remova telefones, WhatsApp, e-mails, @usuários e links externos. Use apenas o fluxo intermediado da plataforma.",
    };
  }

  const msg: ComercialMessage = {
    id: newId("msg"),
    proposalId: input.proposalId,
    senderId: input.senderId,
    senderRole: input.senderRole,
    body: proposal.contactReleased ? input.body : result.sanitized,
    createdAt: new Date().toISOString(),
    sanitized: result.changed && !proposal.contactReleased,
    blockedAttempt: result.blocked && !proposal.contactReleased,
  };
  store().messages.push(msg);
  return { ok: true, message: msg };
}

export function listMessages(proposalId: string): ComercialMessage[] {
  const proposal = store().proposals.find((p) => p.id === proposalId);
  const released = proposal?.contactReleased ?? false;
  return store()
    .messages.filter((m) => m.proposalId === proposalId)
    .map((m) =>
      released
        ? m
        : {
            ...m,
            body: maskContactText(m.body).sanitized,
          },
    );
}

export function listExclusivityLog(): ExclusivityAcceptanceRecord[] {
  return [...store().exclusivityLog];
}
