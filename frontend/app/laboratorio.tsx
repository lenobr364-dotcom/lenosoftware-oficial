"use client";

import { FormEvent, useEffect, useState } from "react";
import { buttonClass, fieldClass } from "@/components/glass";
import {
  FormulaQuimica,
  listFormulas,
  registrarFormula,
} from "@/lib/api";

export default function Laboratorio() {
  const [formulas, setFormulas] = useState<FormulaQuimica[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const next = await listFormulas();
    setFormulas(next);
  }

  useEffect(() => {
    let active = true;
    listFormulas()
      .then((next) => {
        if (active) setFormulas(next);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Falha ao listar fórmulas");
      });
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await registrarFormula({
        codigo: String(data.get("codigo") ?? ""),
        nome: String(data.get("nome") ?? ""),
        categoria: String(data.get("categoria") ?? ""),
        cas_numbers: String(data.get("cas_numbers") ?? ""),
        proporcao_diluicao: String(data.get("proporcao_diluicao") ?? ""),
        custo_producao: Number(data.get("custo_producao")),
        unidade_custo: String(data.get("unidade_custo") ?? "BRL/L"),
        ativo_principal: String(data.get("ativo_principal") ?? "") || undefined,
        componentes: [
          {
            nome: String(data.get("comp_nome") ?? ""),
            cas_number: String(data.get("comp_cas") ?? ""),
            proporcao_percentual: Number(data.get("comp_proporcao")),
            custo_producao: Number(data.get("comp_custo")),
          },
        ].filter((item) => item.nome && item.cas_number),
      });
      form.reset();
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível registrar a fórmula");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm tracking-[0.2em] text-zinc-500 uppercase">ChemVault Global</p>
        <h2 className="text-2xl font-semibold tracking-tight">Laboratório ChemVault Global</h2>
        <p className="text-zinc-400">
          Cadastro persistente de formulações industriais: números CAS, proporção de diluição e
          custo de produção.
        </p>
      </header>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <form
        noValidate
        onSubmit={onSubmit}
        className="grid gap-3 rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md"
      >
        <h3 className="text-sm font-medium text-zinc-500">Registrar fórmula</h3>
        <input className={fieldClass} name="codigo" placeholder="Código (ex.: CV-NOVA-01)" required />
        <input className={fieldClass} name="nome" placeholder="Nome comercial" required />
        <input className={fieldClass} name="categoria" placeholder="Categoria" required />
        <input
          className={fieldClass}
          name="cas_numbers"
          placeholder="CAS (separados por vírgula)"
          required
        />
        <input
          className={fieldClass}
          name="proporcao_diluicao"
          placeholder="Proporção de diluição"
          required
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={fieldClass}
            name="custo_producao"
            type="number"
            min="0"
            step="0.0001"
            placeholder="Custo de produção"
            required
          />
          <input className={fieldClass} name="unidade_custo" defaultValue="BRL/L" />
        </div>
        <input className={fieldClass} name="ativo_principal" placeholder="Ativo principal (opcional)" />
        <p className="text-xs text-zinc-500">Componente principal (opcional)</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={fieldClass} name="comp_nome" placeholder="Nome do componente" />
          <input className={fieldClass} name="comp_cas" placeholder="CAS do componente" />
          <input
            className={fieldClass}
            name="comp_proporcao"
            type="number"
            min="0"
            max="100"
            step="0.0001"
            placeholder="% no lote"
          />
          <input
            className={fieldClass}
            name="comp_custo"
            type="number"
            min="0"
            step="0.0001"
            placeholder="Custo do componente"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className={buttonClass}
        >
          {saving ? "A gravar…" : "Registar no cofre"}
        </button>
      </form>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-zinc-500">{formulas.length} fórmula(s) no cofre</h3>
        {formulas.map((formula) => (
          <article
            key={formula.id}
            className="rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="font-semibold">{formula.nome}</h4>
              <span className="text-xs tracking-wide text-zinc-500">{formula.codigo}</span>
            </div>
            <p className="mt-1 text-sm text-zinc-500">{formula.categoria}</p>
            <dl className="mt-3 grid gap-1 text-sm">
              <div className="flex justify-between gap-4">
                <dt>CAS</dt>
                <dd className="font-mono text-xs">{formula.cas_numbers}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Diluição</dt>
                <dd className="text-right">{formula.proporcao_diluicao}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Custo de produção</dt>
                <dd>
                  {formula.custo_producao} {formula.unidade_custo}
                </dd>
              </div>
            </dl>
            {formula.componentes.length > 0 ? (
              <ul className="mt-3 space-y-1 text-xs text-zinc-500">
                {formula.componentes.map((item) => (
                  <li key={`${formula.id}-${item.cas_number}-${item.nome}`}>
                    {item.nome} · CAS {item.cas_number} · {item.proporcao_percentual}% · custo{" "}
                    {item.custo_producao}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}
