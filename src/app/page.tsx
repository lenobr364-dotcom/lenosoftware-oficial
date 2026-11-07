"use client";
import React, { useState } from "react";

export default function LenoSoftwareHub() {
  const [activeTab, setActiveTab] = useState("hub");

  const squad = [
    { role: "Comando Geral", name: "Lumen Nexus Lvl 3", status: "ONLINE", module: "Leno.Software Core" },
    { role: "Sargento de Operações", name: "Sargento Atlas", status: "EM PATRULHA", module: "CI/CD & DevSecOps" },
    { role: "Líder Químico", name: "Esquadrão ChemVault", status: "ATIVO", module: "16 Formulações & CAS" },
    { role: "Orquestrador IA", name: "Fábrica de Agentes", status: "CONECTADO", module: "Cluster Autônomo" },
    { role: "Soberania & Tradução", name: "Esquadrão YbyRA", status: "OPERACIONAL", module: "Base Etno-Digital FINEP" },
    { role: "Tesouraria Global", name: "Agente Vault-FX", status: "SINCRONIZADO", module: "Nomad Global USD/BRL" },
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-gray-100 font-sans">
      <header className="border-b border-amber-500/20 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xl font-bold tracking-wider text-amber-400">LENO.SOFTWARE</span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
              COMANDO LUMEN & SARGENTO ATLAS
            </span>
          </div>
          <nav className="flex flex-wrap gap-2">
            {[
              { id: "hub", label: "Quartel General" },
              { id: "chemvault", label: "ChemVault Global" },
              { id: "agents", label: "Fábrica de Agentes" },
              { id: "ybyra", label: "Projeto YbyRA" },
              { id: "nomad", label: "Nomad Global (USD)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <section className="p-6 rounded-2xl bg-white/[0.03] border border-amber-500/20 backdrop-blur-xl">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Esquadrão Leno — Comando Central Integrado</h1>
              <p className="text-sm text-gray-400">CNPJ: 36.962.878/0001-55 | Ecossistema Unificado em Nuvem</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              TODOS OS SISTEMAS ONLINE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {squad.map((m, i) => (
              <div key={i} className="p-4 rounded-xl bg-black/60 border border-white/10 hover:border-amber-500/40 transition-all">
                <p className="text-[11px] text-amber-400 font-semibold uppercase">{m.role}</p>
                <h3 className="text-sm font-bold text-white mt-1">{m.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{m.module}</p>
                <div className="mt-3 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {m.status}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/50 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase">SaaS Industrial</span>
              <h2 className="text-xl font-bold text-white mt-2">ChemVault Global</h2>
              <p className="text-sm text-gray-400 mt-2">Motor dinâmico das 16 formulações industriais, códigos CAS e cálculo de bateladas.</p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-emerald-400 font-semibold">● 16 Formulações Ativas</div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/50 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase">Orquestração IA</span>
              <h2 className="text-xl font-bold text-white mt-2">Fábrica de Agentes</h2>
              <p className="text-sm text-gray-400 mt-2">Cluster autônomo em FastAPI e Next.js sob supervisão do Sargento Atlas.</p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-emerald-400 font-semibold">● Cluster Operacional</div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/50 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase">Soberania & Tradução</span>
              <h2 className="text-xl font-bold text-white mt-2">Plataforma YbyRA</h2>
              <p className="text-sm text-gray-400 mt-2">Tradução neural de línguas tradicionais e georreferenciamento territorial (FINEP).</p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-emerald-400 font-semibold">● Motor Etno-Digital Ativo</div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/40 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase">Banking & Câmbio</span>
              <h2 className="text-xl font-bold text-white mt-2">Nomad Global</h2>
              <p className="text-sm text-gray-300 mt-2">Tesouraria internacional em Dólar (USD) integrada para faturamento global do SaaS.</p>
            </div>
            <div className="mt-6 pt-4 border-t border-amber-500/20 text-xs text-amber-400 font-semibold">● Conta Global Conectada</div>
          </div>
        </div>
      </main>
    </div>
  );
}
