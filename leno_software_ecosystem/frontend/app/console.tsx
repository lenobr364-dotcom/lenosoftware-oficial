"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Cliente,
  Relatorio,
  createCliente,
  createRelatorio,
  getHealth,
  listClientes,
  listRelatorios,
} from "@/lib/api";

const fieldClass =
  "rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-foreground outline-none";
const btnClass = "mt-1 rounded-xl bg-accent px-4 py-2.5 font-semibold text-black";

export default function Console() {
  const [health, setHealth] = useState("a verificar…");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const [status, nextClientes, nextRelatorios] = await Promise.all([
      getHealth(),
      listClientes(),
      listRelatorios(),
    ]);
    setHealth(status.status);
    setClientes(nextClientes);
    setRelatorios(nextRelatorios);
  }

  useEffect(() => {
    refresh().catch((err: unknown) => {
      setHealth("offline");
      setError(err instanceof Error ? err.message : "Falha ao contactar a API");
    });
  }, []);

  async function onCreateCliente(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const created = await createCliente({
        nome: String(data.get("nome") ?? ""),
        empresa: String(data.get("empresa") ?? ""),
        email: String(data.get("email") ?? ""),
      });
      form.reset();
      setClienteId(String(created.id));
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível criar o cliente");
    }
  }

  async function onCreateRelatorio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await createRelatorio({
        cliente_id: Number(data.get("cliente_id")),
        ativo: String(data.get("ativo") ?? ""),
        processo: String(data.get("processo") ?? ""),
        descricao: String(data.get("descricao") ?? ""),
        observacoes: String(data.get("observacoes") ?? "") || undefined,
      });
      form.reset();
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível criar o relatório");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm tracking-widest text-accent uppercase">Leno Software Ecosystem</p>
          <h1 className="mt-2 text-3xl font-semibold">Console operacional</h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            Frontend Next.js ligado ao backend FastAPI + SQLAlchemy. Cadastre clientes e
            documentos técnicos.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-4 py-2 text-sm">
          API: <strong className="text-accent">{health}</strong>
        </span>
      </header>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <section className="grid gap-6 md:grid-cols-2">
        <form
          onSubmit={onCreateCliente}
          className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <h2 className="text-lg font-medium">Novo cliente</h2>
          <input name="nome" required placeholder="Nome" className={fieldClass} />
          <input name="empresa" required placeholder="Empresa" className={fieldClass} />
          <input name="email" type="email" required placeholder="E-mail" className={fieldClass} />
          <button type="submit" className={btnClass}>
            Guardar cliente
          </button>
        </form>

        <form
          onSubmit={onCreateRelatorio}
          className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <h2 className="text-lg font-medium">Novo relatório</h2>
          <select
            name="cliente_id"
            required
            className={fieldClass}
            value={clienteId}
            onChange={(event) => setClienteId(event.target.value)}
          >
            <option value="" disabled>
              Selecionar cliente
            </option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome} — {cliente.empresa}
              </option>
            ))}
          </select>
          <input name="ativo" required placeholder="Ativo / equipamento" className={fieldClass} />
          <input name="processo" required placeholder="Processo" className={fieldClass} />
          <textarea
            name="descricao"
            required
            placeholder="Descrição técnica"
            className={`${fieldClass} min-h-20`}
          />
          <textarea name="observacoes" placeholder="Observações" className={`${fieldClass} min-h-16`} />
          <button type="submit" className={btnClass}>
            Guardar relatório
          </button>
        </form>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 p-5">
          <h2 className="mb-3 text-lg font-medium">Clientes ({clientes.length})</h2>
          <ul className="space-y-2 text-sm text-zinc-300">
            {clientes.length === 0 ? <li>Nenhum cliente ainda.</li> : null}
            {clientes.map((cliente) => (
              <li key={cliente.id}>
                {cliente.nome} · {cliente.empresa} · {cliente.email}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 p-5">
          <h2 className="mb-3 text-lg font-medium">Relatórios ({relatorios.length})</h2>
          <ul className="space-y-2 text-sm text-zinc-300">
            {relatorios.length === 0 ? <li>Nenhum relatório ainda.</li> : null}
            {relatorios.map((relatorio) => (
              <li key={relatorio.id}>
                #{relatorio.id} · {relatorio.ativo} · {relatorio.processo}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
