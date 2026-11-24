"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import {
  EXPECTED_LENO_CNPJ,
  getExclusivityTerms,
} from "@/lib/anti-disintermediation/exclusivity-terms";
import {
  COMERCIAL_PLANS,
  MARKETPLACE_COMMISSION,
  type CommissionKind,
} from "@/lib/comercial/plans";
import type { ComercialProposal, PublicEquipment } from "@/lib/comercial/types";

import { AntiDisintermediationBanner } from "./AntiDisintermediationBanner";
import { ComercialCalculators } from "./ComercialCalculators";
import { MaskedText } from "./MaskedText";

type MessageRow = {
  id: string;
  body: string;
  senderRole: string;
  createdAt: string;
  sanitized?: boolean;
};

type Props = {
  locale: string;
  initialEquipment: PublicEquipment[];
  initialProposals: ComercialProposal[];
};

const field =
  "w-full rounded-xl border border-white/10 bg-black/45 px-3 py-2 text-sm text-white outline-none focus:border-amber-400/35";
const btn =
  "inline-flex items-center justify-center rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-50 transition hover:bg-amber-500/25 disabled:opacity-50";

export function FrotaComercialClient({ initialEquipment, initialProposals }: Props) {
  const terms = getExclusivityTerms();
  const [equipment, setEquipment] = useState(initialEquipment);
  const [proposals, setProposals] = useState(initialProposals);
  const [selectedId, setSelectedId] = useState(initialEquipment[0]?.id ?? "");
  const [activeProposalId, setActiveProposalId] = useState(initialProposals[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [hours, setHours] = useState("8");
  const [tons, setTons] = useState("100");
  const [acceptExclusivity, setAcceptExclusivity] = useState(false);
  const [cnpj, setCnpj] = useState(EXPECTED_LENO_CNPJ);
  const [chatBody, setChatBody] = useState("");
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pixValor, setPixValor] = useState("497");
  const [lithology, setLithology] = useState("basalto");
  const [commissionKind, setCommissionKind] = useState<CommissionKind>("subscriber");

  const selected = equipment.find((e) => e.id === selectedId) ?? equipment[0];
  const activeProposal = proposals.find((p) => p.id === activeProposalId) ?? proposals[0];

  const refreshEquipment = useCallback(async () => {
    const res = await fetch("/api/comercial/equipment");
    const data = (await res.json()) as { ok?: boolean; equipment?: PublicEquipment[] };
    if (data.ok && data.equipment) setEquipment(data.equipment);
  }, []);

  const refreshProposals = useCallback(async () => {
    const res = await fetch("/api/comercial/proposals");
    const data = (await res.json()) as { ok?: boolean; proposals?: ComercialProposal[] };
    if (data.ok && data.proposals) {
      setProposals(data.proposals);
      if (data.proposals[0] && !activeProposalId) setActiveProposalId(data.proposals[0].id);
    }
  }, [activeProposalId]);

  const loadMessages = useCallback(async (proposalId: string) => {
    if (!proposalId) {
      setMessages([]);
      return;
    }
    const res = await fetch(`/api/comercial/messages?proposalId=${encodeURIComponent(proposalId)}`);
    const data = (await res.json()) as { ok?: boolean; messages?: MessageRow[] };
    if (data.ok && data.messages) setMessages(data.messages);
  }, []);

  useEffect(() => {
    if (activeProposalId) void loadMessages(activeProposalId);
  }, [activeProposalId, loadMessages]);

  async function onCreateProposal(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/comercial/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: selected.id,
          notes,
          requestedHours: Number(hours) || 1,
          estimatedTons: Number(tons) || 0,
          locatarioDisplayName: "Locatário",
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        proposal?: ComercialProposal;
        notesSanitized?: boolean;
      };
      if (!res.ok || !data.ok || !data.proposal) {
        setStatus(data.message ?? "Falha ao criar proposta");
        return;
      }
      setNotes("");
      setActiveProposalId(data.proposal.id);
      setStatus(
        data.notesSanitized
          ? "Proposta criada — observações sanitizadas (contatos removidos)."
          : "Proposta criada no fluxo intermediado.",
      );
      await refreshProposals();
    } finally {
      setBusy(false);
    }
  }

  async function onAccept() {
    if (!activeProposal) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/comercial/proposals/${encodeURIComponent(activeProposal.id)}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acceptExclusivity,
          acknowledgeCnpj: cnpj,
          formalize: false,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setStatus(data.message ?? "Aceite recusado");
        return;
      }
      setStatus("Exclusividade aceita. Gere o Pix para liberar contatos.");
      await refreshProposals();
      await refreshEquipment();
    } finally {
      setBusy(false);
    }
  }

  async function onPix(e: FormEvent) {
    e.preventDefault();
    if (!activeProposal) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/comercial/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: activeProposal.id,
          valor: Number(pixValor) || 1,
          descricao: `Locação ${activeProposal.equipmentName}`,
          clienteEmail: "cliente@empresa.example",
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        contactsReleased?: boolean;
        cobranca?: { linha_digitavel?: string };
      };
      if (!res.ok || !data.ok) {
        setStatus(data.message ?? "Pix recusado");
        return;
      }
      setStatus(
        data.contactsReleased
          ? `Pix gerado e contatos liberados. ${data.cobranca?.linha_digitavel ? "EMV pronto." : ""}`
          : "Pix gerado.",
      );
      await refreshProposals();
      await refreshEquipment();
    } finally {
      setBusy(false);
    }
  }

  async function onChat(e: FormEvent) {
    e.preventDefault();
    if (!activeProposal || !chatBody.trim()) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/comercial/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: activeProposal.id,
          body: chatBody,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setStatus(typeof data.message === "string" ? data.message : "Mensagem bloqueada");
        return;
      }
      setChatBody("");
      await loadMessages(activeProposal.id);
    } finally {
      setBusy(false);
    }
  }

  function exportProposalPdf() {
    if (!activeProposal) return;
    const qs = new URLSearchParams({
      lithology,
      commissionKind,
      mobilizationBrl: "2500",
      demobilizationBrl: "1800",
    });
    window.open(
      `/api/comercial/proposals/${encodeURIComponent(activeProposal.id)}/pdf?${qs.toString()}`,
      "_blank",
      "noopener,noreferrer",
    );
    setStatus("PDF da proposta comercial aberto (cálculos detalhados; contatos só se liberados).");
  }

  return (
    <div className="space-y-8 text-white">
      <header className="space-y-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-amber-200/75">
          BritaGrid Brasil · frota comercial · Leno.software
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Equipamentos, propostas e Pix
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          Intermediação obrigatória ({terms.operatorLine}). Cobrança Pix Santander PJ · CNPJ{" "}
          {EXPECTED_LENO_CNPJ}. Contatos só após aceite e pagamento formal.
        </p>
        <AntiDisintermediationBanner />
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {COMERCIAL_PLANS.map((plan) => (
          <article
            key={plan.id}
            className="rounded-2xl border border-amber-500/25 bg-zinc-950/70 p-5"
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-amber-200/70">
              Assinatura mensal · Pix Santander PJ
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">{plan.name}</h2>
            <p className="mt-2 font-mono text-2xl text-amber-100">
              R$ {plan.priceMonthlyBrl.toFixed(2).replace(".", ",")}/mês
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-zinc-400">
              {plan.features.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
      <p className="text-sm text-zinc-400">
        Comissão marketplace vinculada ao termo de exclusividade:{" "}
        <strong className="text-amber-100">{MARKETPLACE_COMMISSION.subscriberLabel}</strong> ·{" "}
        <strong className="text-amber-100">{MARKETPLACE_COMMISSION.adHocLabel}</strong>.
      </p>

      <ComercialCalculators />

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Catálogo da frota</h2>
          {equipment.map((eq) => (
            <button
              key={eq.id}
              type="button"
              onClick={() => setSelectedId(eq.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                selected?.id === eq.id
                  ? "border-amber-400/45 bg-amber-500/10"
                  : "border-white/10 bg-zinc-950/70 hover:border-amber-400/25"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-semibold">
                  {eq.codigo} · {eq.name}
                </p>
                <span className="text-[0.65rem] uppercase text-zinc-500">{eq.status}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {eq.region} · R$ {eq.hourlyRateBrl}/h · {eq.capacityTph} t/h
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                <MaskedText text={eq.description} released={eq.contactReleased} />
              </p>
              {eq.contactReleased ? (
                <p className="mt-2 font-mono text-xs text-emerald-300">
                  Contato liberado: {eq.phone ?? "—"} · {eq.whatsapp ?? "—"} · {eq.email ?? "—"}
                </p>
              ) : (
                <p className="mt-2 text-xs text-amber-200/70">Contatos ocultos até formalização/Pix</p>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <form onSubmit={onCreateProposal} className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Nova proposta</h2>
            <p className="text-sm text-zinc-300">
              Equipamento: <strong>{selected?.codigo ?? "—"}</strong>
            </p>
            <label className="block text-xs text-zinc-400">
              Observações
              <textarea
                className={`${field} mt-1 min-h-[88px]`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Sem telefone, WhatsApp, e-mail ou links externos"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-zinc-400">
                Horas
                <input className={`${field} mt-1`} value={hours} onChange={(e) => setHours(e.target.value)} />
              </label>
              <label className="text-xs text-zinc-400">
                Toneladas est.
                <input className={`${field} mt-1`} value={tons} onChange={(e) => setTons(e.target.value)} />
              </label>
            </div>
            <button type="submit" className={btn} disabled={busy || !selected}>
              Enviar proposta
            </button>
          </form>

          <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Aceite de exclusividade
            </h2>
            <p className="text-sm text-zinc-300">
              Proposta ativa: <strong>{activeProposal?.id ?? "nenhuma"}</strong>
              {activeProposal ? ` · ${activeProposal.status}` : null}
            </p>
            <ul className="space-y-2 text-xs text-zinc-400">
              {terms.sections.map((s) => (
                <li key={s.id}>
                  <span className="font-semibold text-zinc-200">{s.title}</span> — {s.body}
                </li>
              ))}
            </ul>
            <label className="flex items-start gap-2 text-sm text-zinc-200">
              <input
                type="checkbox"
                className="mt-1"
                checked={acceptExclusivity}
                onChange={(e) => setAcceptExclusivity(e.target.checked)}
              />
              Aceito exclusividade/comissão Leno.software (CNPJ {EXPECTED_LENO_CNPJ})
            </label>
            <label className="block text-xs text-zinc-400">
              Confirmar CNPJ
              <input className={`${field} mt-1`} value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
            </label>
            <button type="button" className={btn} disabled={busy || !activeProposal} onClick={() => void onAccept()}>
              Registrar aceite
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Proposta comercial PDF
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-zinc-400">
                Litologia
                <select className={`${field} mt-1`} value={lithology} onChange={(e) => setLithology(e.target.value)}>
                  <option value="arenito">Arenito</option>
                  <option value="calcário">Calcário</option>
                  <option value="basalto">Basalto</option>
                  <option value="granito">Granito</option>
                  <option value="quartzito">Quartzito</option>
                </select>
              </label>
              <label className="text-xs text-zinc-400">
                Comissão
                <select
                  className={`${field} mt-1`}
                  value={commissionKind}
                  onChange={(e) => setCommissionKind(e.target.value as CommissionKind)}
                >
                  <option value="subscriber">Assinante 2,5%</option>
                  <option value="adhoc">Avulsa 4,0%</option>
                </select>
              </label>
            </div>
            <button type="button" className={btn} disabled={!activeProposal} onClick={exportProposalPdf}>
              Exportar proposta PDF
            </button>
          </div>

          <form onSubmit={onPix} className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Checkout Pix Santander PJ (Leno.software)
            </h2>
            <label className="block text-xs text-zinc-400">
              Valor (BRL) — ex.: 497 Operador ou 1490 Enterprise
              <input className={`${field} mt-1`} value={pixValor} onChange={(e) => setPixValor(e.target.value)} />
            </label>
            <button type="submit" className={btn} disabled={busy || !activeProposal}>
              Gerar Pix e liberar contatos
            </button>
          </form>

          <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Mensagens</h2>
            <div className="max-h-48 space-y-2 overflow-y-auto text-sm">
              {messages.length === 0 ? (
                <p className="text-zinc-500">Nenhuma mensagem nesta proposta.</p>
              ) : (
                messages.map((m) => (
                  <p key={m.id} className="rounded-xl border border-white/5 bg-black/30 px-3 py-2 text-zinc-200">
                    <span className="text-[0.65rem] uppercase text-zinc-500">{m.senderRole}</span>
                    <br />
                    {m.body}
                  </p>
                ))
              )}
            </div>
            <form onSubmit={onChat} className="flex gap-2">
              <input
                className={`${field} flex-1`}
                value={chatBody}
                onChange={(e) => setChatBody(e.target.value)}
                placeholder="Sem contatos externos"
              />
              <button type="submit" className={btn} disabled={busy || !activeProposal}>
                Enviar
              </button>
            </form>
          </div>
        </div>
      </section>

      {status ? (
        <p className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-50" role="status">
          {status}
        </p>
      ) : null}

      {proposals.length > 0 ? (
        <section className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Propostas</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {proposals.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="text-left text-amber-100 hover:underline"
                  onClick={() => setActiveProposalId(p.id)}
                >
                  {p.id} · {p.equipmentName} · {p.status}
                  {p.contactReleased ? " · contatos liberados" : ""}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
