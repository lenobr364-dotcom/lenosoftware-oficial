"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { AntiDisintermediationBanner } from "@/components/britagrid/AntiDisintermediationBanner";
import { BritagridCalculators } from "@/components/britagrid/BritagridCalculators";
import { MaskedText } from "@/components/britagrid/MaskedText";
import {
  BRITAGRID_OPERATOR,
  getExclusivityTerms,
} from "@/lib/britagrid/exclusivity-terms";
import type {
  BritagridMessage,
  BritagridProposal,
  PublicEquipment,
} from "@/lib/britagrid/types";

const field =
  "w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-500/40";

type Props = {
  locale: string;
  initialEquipment: PublicEquipment[];
  initialProposals: BritagridProposal[];
};

export function BritagridMarketplaceClient({
  locale,
  initialEquipment,
  initialProposals,
}: Props) {
  const terms = useMemo(() => getExclusivityTerms(), []);
  const [equipment, setEquipment] = useState(initialEquipment);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialEquipment[0]?.id ?? null,
  );
  const [proposals, setProposals] = useState(initialProposals);
  const [messages, setMessages] = useState<BritagridMessage[]>([]);
  const [activeProposalId, setActiveProposalId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [notes, setNotes] = useState("");
  const [hours, setHours] = useState(8);
  const [tons, setTons] = useState(200);
  const [displayName, setDisplayName] = useState("Construtora Demo");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [cnpjAck, setCnpjAck] = useState(BRITAGRID_OPERATOR.cnpj);
  const [chatBody, setChatBody] = useState("");

  const selected = equipment.find((e) => e.id === selectedId) ?? null;

  async function refreshEquipment() {
    const res = await fetch("/api/britagrid/equipment");
    const data = await res.json();
    if (data.ok) setEquipment(data.equipment);
  }

  async function refreshProposals() {
    const res = await fetch("/api/britagrid/proposals");
    const data = await res.json();
    if (data.ok) setProposals(data.proposals);
  }

  async function refreshMessages(proposalId: string) {
    const res = await fetch(
      `/api/britagrid/messages?proposalId=${encodeURIComponent(proposalId)}`,
    );
    const data = await res.json();
    if (data.ok) setMessages(data.messages);
  }

  async function submitProposal() {
    if (!selected) return;
    setError(null);
    setStatus(null);
    const res = await fetch("/api/britagrid/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        equipmentId: selected.id,
        locatarioDisplayName: displayName,
        notes,
        requestedHours: hours,
        estimatedTons: tons,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.message ?? "Falha ao criar proposta.");
      return;
    }
    setStatus(
      data.notesSanitized
        ? "Proposta enviada. Observações sanitizadas (contatos mascarados)."
        : "Proposta enviada no fluxo intermediado BritaGrid.",
    );
    setNotes("");
    setActiveProposalId(data.proposal.id);
    setMessages([]);
    startTransition(() => {
      void refreshProposals();
    });
  }

  async function acceptProposal(proposalId: string, formalize: boolean) {
    setError(null);
    setStatus(null);
    if (!acceptTerms) {
      setError(
        "Marque o aceite dos termos de exclusividade/comissão da Leno.software.",
      );
      return;
    }
    const res = await fetch(`/api/britagrid/proposals/${proposalId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        acceptExclusivity: true,
        acknowledgeCnpj: cnpjAck,
        formalize,
        actorRole: "locatario",
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.message ?? "Falha no aceite.");
      return;
    }
    setStatus(data.message);
    startTransition(() => {
      void refreshProposals();
      void refreshEquipment();
      if (formalize) void refreshMessages(proposalId);
    });
  }

  async function openChat(proposalId: string) {
    setActiveProposalId(proposalId);
    setError(null);
    await refreshMessages(proposalId);
  }

  async function sendChat() {
    if (!activeProposalId || !chatBody.trim()) return;
    setError(null);
    const res = await fetch("/api/britagrid/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proposalId: activeProposalId,
        body: chatBody,
        senderRole: "locatario",
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.message ?? "Mensagem bloqueada.");
      return;
    }
    setChatBody("");
    if (data.notice) setStatus(data.notice);
    await refreshMessages(activeProposalId);
  }

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/45">
          {BRITAGRID_OPERATOR.holding} · CNPJ {BRITAGRID_OPERATOR.cnpj}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          BritaGrid Brasil
        </h1>
        <p className="max-w-2xl text-base text-white/60">
          Marketplace intermediado de britagem móvel. Negociação, proposta e contrato
          permanecem na plataforma — sem contato direto antes da liberação autorizada.
        </p>
        <AntiDisintermediationBanner />
      </header>

      <BritagridCalculators />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/50">
            Equipamentos
          </h2>
          <ul className="space-y-3">
            {equipment.map((eq) => (
              <li key={eq.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(eq.id)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    selectedId === eq.id
                      ? "border-amber-500/40 bg-amber-500/[0.08]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium text-white">{eq.name}</span>
                    <span className="text-sm text-white/50">
                      R$ {eq.hourlyRateBrl}/h · {eq.capacityTph} t/h
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-white/45">{eq.region}</p>
                  <p className="mt-2 text-sm text-white/70">
                    <MaskedText text={eq.description} released={eq.contactReleased} />
                  </p>
                  <p className="mt-2 text-xs text-white/40">
                    Locador: {eq.ownerDisplayName}
                    {eq.contactReleased
                      ? ` · ${eq.phone ?? eq.whatsapp ?? eq.email ?? "contato liberado"}`
                      : " · contatos ocultos"}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/50">
            Solicitar locação
          </h2>
          {selected ? (
            <>
              <p className="text-white">{selected.name}</p>
              <AntiDisintermediationBanner compact />
              <label className="block text-xs text-white/45">
                Seu nome / empresa
                <input
                  className={`${field} mt-1`}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs text-white/45">
                  Horas
                  <input
                    className={`${field} mt-1`}
                    type="number"
                    min={1}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                  />
                </label>
                <label className="block text-xs text-white/45">
                  Toneladas estimadas
                  <input
                    className={`${field} mt-1`}
                    type="number"
                    min={0}
                    value={tons}
                    onChange={(e) => setTons(Number(e.target.value))}
                  />
                </label>
              </div>
              <label className="block text-xs text-white/45">
                Observações (telefones/WhatsApp/e-mails/links serão mascarados)
                <textarea
                  className={`${field} mt-1 min-h-[88px]`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Descreva a obra sem compartilhar contato direto…"
                />
              </label>
              <button
                type="button"
                onClick={() => void submitProposal()}
                className="w-full rounded-xl bg-amber-600/90 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-500"
              >
                Enviar proposta na plataforma
              </button>
            </>
          ) : (
            <p className="text-sm text-white/50">Selecione um equipamento.</p>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/50">
          Propostas e aceite de exclusividade
        </h2>
        <div className="rounded-xl border border-white/8 bg-black/25 p-4 text-sm text-white/65">
          <p className="font-medium text-white/85">{terms.title}</p>
          <p className="mt-1 text-white/45">{terms.operatorLine}</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {terms.sections.map((s) => (
              <li key={s.id}>
                <span className="text-white/80">{s.title}</span> — {s.body}
              </li>
            ))}
          </ul>
        </div>

        <label className="flex items-start gap-3 text-sm text-white/70">
          <input
            type="checkbox"
            className="mt-1"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
          />
          <span>
            Li e aceito os termos de exclusividade e comissão da Leno.software (CNPJ{" "}
            {BRITAGRID_OPERATOR.cnpj}). Reconheço que contato direto antes da liberação
            viola os termos e pode gerar bloqueio/multa.
          </span>
        </label>
        <label className="block text-xs text-white/45">
          Confirmar CNPJ Leno.software
          <input
            className={`${field} mt-1 max-w-xs`}
            value={cnpjAck}
            onChange={(e) => setCnpjAck(e.target.value)}
          />
        </label>

        <ul className="space-y-3">
          {proposals.length === 0 && (
            <li className="text-sm text-white/45">Nenhuma proposta ainda.</li>
          )}
          {proposals.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  className="text-left font-medium text-white hover:underline"
                  onClick={() => void openChat(p.id)}
                >
                  {p.equipmentName}
                </button>
                <span className="rounded-md border border-white/10 px-2 py-0.5 text-xs uppercase tracking-wide text-white/50">
                  {p.status}
                </span>
              </div>
              <p className="mt-1 text-white/55">
                {p.requestedHours} h · {p.estimatedTons} t · {p.locatarioDisplayName}
              </p>
              <p className="mt-1 text-white/70">
                <MaskedText
                  text={p.notes || "(sem observações)"}
                  released={p.contactReleased}
                />
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.status === "enviada" && (
                  <button
                    type="button"
                    onClick={() => void acceptProposal(p.id, false)}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:border-amber-500/40"
                  >
                    Aceitar + registrar exclusividade
                  </button>
                )}
                {(p.status === "aceita" || p.status === "enviada") && (
                  <button
                    type="button"
                    onClick={() => void acceptProposal(p.id, true)}
                    className="rounded-lg bg-amber-600/80 px-3 py-1.5 text-xs font-semibold text-black hover:bg-amber-500"
                  >
                    Formalizar e liberar contatos
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void openChat(p.id)}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80"
                >
                  Abrir chat
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {activeProposalId && (
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/50">
            Chat intermediado
          </h2>
          <AntiDisintermediationBanner compact />
          <ul className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-white/8 bg-black/30 p-3 text-sm">
            {messages.length === 0 && (
              <li className="text-white/40">
                Sem mensagens. Contatos no texto serão mascarados.
              </li>
            )}
            {messages.map((m) => (
              <li key={m.id} className="rounded-lg bg-white/[0.04] px-3 py-2 text-white/80">
                <span className="text-xs uppercase tracking-wide text-white/40">
                  {m.senderRole}
                  {m.blockedAttempt ? " · tentativa de contato mascarada" : ""}
                </span>
                <p className="mt-0.5">{m.body}</p>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              className={field}
              value={chatBody}
              onChange={(e) => setChatBody(e.target.value)}
              placeholder="Escreva sem telefone, WhatsApp, e-mail ou link…"
            />
            <button
              type="button"
              onClick={() => void sendChat()}
              className="shrink-0 rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
            >
              Enviar
            </button>
          </div>
        </section>
      )}

      {(status || error) && (
        <p
          className={`rounded-xl border px-4 py-3 text-sm ${
            error
              ? "border-red-500/30 bg-red-500/10 text-red-100"
              : "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
          }`}
          role="status"
        >
          {error ?? status}
        </p>
      )}

      <p className="text-center text-xs text-white/35">
        <Link href={`/${locale}`} className="underline-offset-2 hover:underline">
          Voltar ao portal Leno.software
        </Link>
      </p>
    </div>
  );
}
