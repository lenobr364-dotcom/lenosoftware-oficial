"use client";

import { glassButton, glassPanelDense } from "@/lib/ui-glass";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

export default function GlobalCard({
  title,
  value,
  lang = "EN",
}: {
  title: string;
  value: string;
  lang?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center gap-4 p-6 ${glassPanelDense}`}
    >
      <div className="mb-2 flex w-full items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
          {lang} / GLOBAL LICENSE
        </span>
        <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
      </div>

      <h3 className="text-xl font-light tracking-tight text-white">{title}</h3>

      <div className="rounded-xl bg-white p-3 shadow-inner">
        <QRCodeSVG value={value} size={140} level="H" includeMargin={false} />
      </div>

      <p className="max-w-[150px] break-all text-center font-mono text-[9px] text-white/40">
        {value}
      </p>

      <button type="button" className={`w-full py-3 text-xs uppercase tracking-widest ${glassButton}`}>
        ACCESS DATABASE
      </button>
    </motion.div>
  );
}

