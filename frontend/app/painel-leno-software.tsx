"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { GlassCard, MetricValue, StatusBadge } from "@/components/glass";
import { API_URL } from "@/lib/api";

export default function PainelLenoSoftware() {
  const [status, setStatus] = useState("Conectando...");
  const [agentes, setAgentes] = useState("Carregando...");

  useEffect(() => {
    async function checarStatusAPI() {
      try {
        const response = await fetch(`${API_URL}/`);
        if (response.ok) {
          setStatus("Online");
          setAgentes("Lumen onel");
        } else {
          setStatus("Falha na API");
        }
      } catch {
        setStatus("Offline");
      }
    }

    void checarStatusAPI();
    const intervalo = setInterval(() => {
      void checarStatusAPI();
    }, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const ligado = status === "Online";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="grid grid-cols-1 gap-4 md:grid-cols-12"
    >
      <GlassCard className="md:col-span-8">
        <StatusBadge live={ligado}>{ligado ? "Agentes ligados" : status}</StatusBadge>
        <p className="mt-4 text-xs tracking-[0.28em] text-amber-200/70 uppercase">Orquestração</p>
        <h2 className="mt-3 bg-gradient-to-r from-amber-100 to-yellow-500 bg-clip-text text-3xl font-semibold text-transparent">
          Fábrica de Agentes
        </h2>
      </GlassCard>

      <GlassCard className="md:col-span-4">
        <p className="text-sm text-zinc-500">Status da Orquestração</p>
        <div className="mt-4">
          <MetricValue tone={ligado ? "green" : "plain"}>{status}</MetricValue>
        </div>
      </GlassCard>

      <GlassCard className="md:col-span-12">
        <p className="text-sm text-zinc-500">Agentes Ativos</p>
        <div className="mt-4">
          <MetricValue>{agentes}</MetricValue>
        </div>
      </GlassCard>
    </motion.div>
  );
}
