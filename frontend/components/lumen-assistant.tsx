"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { buttonClass, fieldClass } from "@/components/glass";
import { getEconomiaMonitor, getRoot } from "@/lib/api";

function NeonMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]">
      <path
        d="M12 2.5 14.2 9.8 21.5 12 14.2 14.2 12 21.5 9.8 14.2 2.5 12 9.8 9.8 12 2.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

type Mensagem = {
  id: number;
  papel: "lumen" | "executivo";
  texto: string;
};

async function responder(comando: string) {
  const consulta = comando.toLowerCase();
  if (consulta.includes("saldo") || consulta.includes("economia") || consulta.includes("lnc")) {
    const economia = await getEconomiaMonitor();
    const lumen = economia.carteiras.find((carteira) => carteira.codigo === "AG-LUMEN-ONEL");
    const steward = economia.carteiras.find((carteira) => carteira.codigo === "AG-CHEMVAULT");
    return `Livro-razão no Cloud Run. Lumen Onel ${lumen?.saldo ?? "—"} LNC. Steward ChemVault ${steward?.saldo ?? "—"} LNC. Volume ${economia.volume_total}. Custo ${economia.custo_computacional_total}.`;
  }
  if (consulta.includes("status") || consulta.includes("cloud") || consulta.includes("online")) {
    const raiz = await getRoot();
    return `${raiz.ecosystem} está ${raiz.status}. Lumen ${raiz.lumen}. Fábrica ${raiz.modules.fabrica_de_agentes.status}. ChemVault ${raiz.modules.chemvault_global.status}. Economia ${raiz.modules.economia?.status ?? "reserved"}.`;
  }
  return "Comandos rápidos: status, cloud, saldo. Eu consulto o Cloud Run e devolvo o estado do ecossistema.";
}

export default function LumenAssistant() {
  const [aberto, setAberto] = useState(false);
  const [rascunho, setRascunho] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: 1,
      papel: "lumen",
      texto: "Lumen onel em escuta. Peça status ou saldo.",
    },
  ]);

  function maskContacts(texto: string): string {
    return texto
      .replace(/(?:whats?\s*app|zap|wpp|wa\.me)[\s:/]*(?:\+?\d[\d\s().-]{7,}\d)?/gi, "[contato oculto pela plataforma]")
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[contato oculto pela plataforma]")
      .replace(/(?:https?:\/\/|www\.)[^\s<>"']+/gi, "[link externo bloqueado]")
      .replace(/(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,3}\)?[\s.-]?)?\d{4,5}[\s.-]?\d{4}\b/g, "[contato oculto pela plataforma]")
      .replace(/(^|[\s(,;:])@([a-zA-Z0-9._]{2,30})\b/g, "$1[perfil social oculto]");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const bruto = rascunho.trim();
    const texto = maskContacts(bruto);
    if (!texto || enviando) {
      return;
    }
    if (!texto.replace(/\[(contato oculto pela plataforma|link externo bloqueado|perfil social oculto)\]/g, "").trim() && bruto !== texto) {
      setMensagens((atual) => [
        ...atual,
        {
          id: Date.now(),
          papel: "lumen",
          texto:
            "Mensagem bloqueada: remova telefones, WhatsApp, e-mails, @usuários e links. Negociação só no fluxo Leno.software.",
        },
      ]);
      setRascunho("");
      return;
    }
    const idExecutivo = Date.now();
    setMensagens((atual) => [...atual, { id: idExecutivo, papel: "executivo", texto }]);
    setRascunho("");
    setEnviando(true);
    try {
      const resposta = await responder(texto);
      setMensagens((atual) => [...atual, { id: idExecutivo + 1, papel: "lumen", texto: resposta }]);
    } catch (err: unknown) {
      const detalhe = err instanceof Error ? err.message : "Falha ao contactar o Cloud Run";
      setMensagens((atual) => [
        ...atual,
        { id: idExecutivo + 1, papel: "lumen", texto: `Sem ligação. ${detalhe}` },
      ]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col items-end gap-3">
      <AnimatePresence>
        {aberto ? (
          <motion.section
            key="gaveta-lumen"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full transform-gpu rounded-3xl bg-gradient-to-br from-amber-300/70 via-amber-500/20 to-emerald-300/30 p-px shadow-[0_24px_70px_rgba(251,191,36,0.22)]"
          >
            <div className="flex h-[28rem] max-h-[70vh] flex-col rounded-[calc(1.5rem-1px)] bg-black/80 backdrop-blur-xl">
              <header className="flex items-center justify-between border-b border-amber-500/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-amber-200">
                    <NeonMark />
                  </span>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.22em] text-amber-200 uppercase">
                      Lumen Assistant
                    </p>
                    <p className="text-sm text-zinc-300">Comandos executivos</p>
                  </div>
                </div>
                <button type="button" onClick={() => setAberto(false)} className={`${buttonClass} px-3 py-1 text-xs`}>
                  Minimizar
                </button>
              </header>
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
                {mensagens.map((mensagem) => (
                  <p
                    key={mensagem.id}
                    className={`max-w-[90%] rounded-2xl border px-3 py-2 text-sm leading-relaxed ${
                      mensagem.papel === "lumen"
                        ? "border-amber-500/20 bg-black/40 text-zinc-200"
                        : "ml-auto border-amber-300/40 bg-amber-300/10 text-amber-50"
                    }`}
                  >
                    {mensagem.texto}
                  </p>
                ))}
              </div>
              <form onSubmit={(event) => void onSubmit(event)} className="flex gap-2 border-t border-amber-500/30 p-3">
                <input
                  value={rascunho}
                  onChange={(event) => setRascunho(event.target.value)}
                  placeholder="status ou saldo"
                  className={`${fieldClass} min-w-0 flex-1 font-mono`}
                />
                <button type="submit" disabled={enviando} className={buttonClass}>
                  Enviar
                </button>
              </form>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
      <button
        type="button"
        aria-expanded={aberto}
        onClick={() => setAberto((atual) => !atual)}
        className="inline-flex items-center gap-2 rounded-full border border-amber-400/70 bg-black/40 px-4 py-3 font-mono text-xs tracking-[0.16em] text-amber-100 uppercase shadow-[0_0_28px_rgba(251,191,36,0.45)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_36px_rgba(251,191,36,0.62)] active:scale-[0.98]"
      >
        <span className="text-amber-200">
          <NeonMark />
        </span>
        <span className="h-2 w-2 rounded-full bg-emerald-400 lumen-pulse" />
        Lumen
      </button>
    </div>
  );
}
