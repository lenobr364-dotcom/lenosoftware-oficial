"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  downloadClientFispqPdf,
  type ClientFispqPdfLabels,
} from "@/lib/generate-client-fispq-pdf";

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: ((i * 37.3) % 92) + 4,
  top: ((i * 23.7) % 86) + 7,
  duration: 4.5 + (i % 6) * 0.4,
  delay: i * 0.1,
  size: 1.5 + (i % 3) * 0.6,
}));

type Copy = {
  docSignature: string;
  clientNotice: string;
  eyebrow: string;
  brand: string;
  mixingTitle: string;
  safetyTitle: string;
  footer: string;
  fispqButton: string;
  fispqGenerating: string;
  pdf: ClientFispqPdfLabels;
};

export function ClientAccessExperience({
  locale,
  formulaName,
  code,
  mixingInstructions,
  safetyPrecautions,
  copy,
}: {
  locale: string;
  formulaName: string;
  code: string;
  mixingInstructions: string;
  safetyPrecautions: string;
  copy: Copy;
}) {
  const [pdfBusy, setPdfBusy] = useState(false);

  const handleFispq = () => {
    setPdfBusy(true);
    try {
      const issuedAtFormatted = new Intl.DateTimeFormat(locale, {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date());
      downloadClientFispqPdf({
        formulaName,
        code,
        mixingInstructions,
        safetyPrecautions,
        issuedAtFormatted,
        labels: copy.pdf,
      });
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-5 py-10 text-white sm:px-10 md:px-16 md:py-12">
      <div className="pointer-events-none absolute inset-0 z-0">
        <motion.div
          className="absolute -left-1/4 top-0 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.18),transparent_62%)] blur-3xl"
          animate={{ opacity: [0.35, 0.55, 0.38], scale: [1, 1.06, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-[-10%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.14),transparent_58%)] blur-3xl"
          animate={{ opacity: [0.25, 0.45, 0.3], x: [0, -12, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/3 top-1/2 h-[20rem] w-[20rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_55%)] blur-3xl"
          animate={{ opacity: [0.15, 0.28, 0.18] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.15),rgba(0,0,0,0.88))]" />
        {PARTICLES.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-emerald-400/25 shadow-[0_0_12px_rgba(52,211,153,0.35)]"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
            }}
            animate={{ opacity: [0.12, 0.45, 0.15], y: [0, -10, 0] }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-2xl">
        <p className="border-b border-white/[0.08] pb-4 text-center text-[0.62rem] font-medium uppercase leading-relaxed tracking-[0.18em] text-yellow-100/75 sm:text-[0.65rem] sm:tracking-[0.22em]">
          {copy.docSignature}
        </p>

        <header className="mt-10 text-center">
          <p className="text-[0.65rem] uppercase tracking-[0.42em] text-yellow-400/80">{copy.eyebrow}</p>
          <h1
            className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ textShadow: "0 0 24px rgba(253,224,71,0.2)" }}
          >
            {formulaName}
          </h1>
          <p className="mt-2 font-mono text-sm text-gray-500">{code}</p>
          <p className="mx-auto mt-3 max-w-lg text-xs leading-relaxed text-gray-500/90">{copy.clientNotice}</p>
          <p className="mx-auto mt-5 max-w-md text-[0.65rem] uppercase tracking-[0.28em] text-emerald-400/70">
            {copy.brand}
          </p>
        </header>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handleFispq}
            disabled={pdfBusy}
            className="rounded-full border border-yellow-500/35 bg-gradient-to-b from-yellow-500/15 to-yellow-600/5 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-100/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm transition hover:border-yellow-400/50 hover:from-yellow-500/25 disabled:cursor-wait disabled:opacity-60"
          >
            {pdfBusy ? copy.fispqGenerating : copy.fispqButton}
          </button>
        </div>

        <div className="mt-12 space-y-8">
          <GlassBlock title={copy.mixingTitle} body={mixingInstructions} variant="gold" />
          <GlassBlock title={copy.safetyTitle} body={safetyPrecautions} variant="emerald" />
        </div>

        <p className="mt-14 text-center text-[0.62rem] leading-relaxed text-gray-500 sm:text-[0.65rem]">
          {copy.footer}
        </p>
      </div>
    </main>
  );
}

function GlassBlock({
  title,
  body,
  variant,
}: {
  title: string;
  body: string;
  variant: "gold" | "emerald";
}) {
  const border =
    variant === "emerald"
      ? "border-emerald-500/20 ring-emerald-500/[0.07]"
      : "border-yellow-500/20 ring-yellow-500/[0.08]";
  const titleClass =
    variant === "emerald" ? "text-emerald-200/95" : "text-yellow-200/90";

  return (
    <section
      className={`rounded-[1.75rem] border bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl ring-1 ${border}`}
    >
      <h2 className={`text-sm font-semibold uppercase tracking-[0.22em] ${titleClass}`}>{title}</h2>
      <p className="mt-4 text-sm leading-relaxed text-gray-300 md:text-base">{body}</p>
    </section>
  );
}
