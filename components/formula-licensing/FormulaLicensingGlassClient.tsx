"use client";

import { useMemo, useState } from "react";

type FpRow = {
  formulaId: string;
  code: string;
  name: string;
  licenseStatus: string;
  lastUpdated: string;
  securityFingerprintSha256: string;
};

type GrantRow = {
  id: string;
  clientSubject: string;
  formulaCode: string;
  validFrom: string;
  validUntil: string;
  status: string;
  validity: string;
  grantHash: string;
  chainAnchor: string | null;
  createdAt: string;
};

export function FormulaLicensingGlassClient({
  fingerprints,
  initialGrants,
}: {
  fingerprints: FpRow[];
  initialGrants: GrantRow[];
}) {
  const [grants, setGrants] = useState(initialGrants);
  const [clientSubject, setClientSubject] = useState("client:demo:BR");
  const [formulaCode, setFormulaCode] = useState(fingerprints[0]?.code ?? "CV-SOL-001");
  const [validFrom, setValidFrom] = useState(() => new Date().toISOString().slice(0, 16));
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 16);
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const shell = useMemo(
    () =>
      [
        "rounded-[1.75rem] border border-white/[0.12]",
        "bg-[linear-gradient(165deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.04)_42%,rgba(2,3,8,0.55)_100%)]",
        "p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_18px_48px_-20px_rgba(0,0,0,0.65)]",
        "backdrop-blur-[28px] backdrop-saturate-[1.35]",
      ].join(" "),
    [],
  );

  async function mint() {
    setBusy(true);
    setMsg(null);
    try {
      const from = new Date(validFrom).toISOString();
      const until = new Date(validUntil).toISOString();
      const res = await fetch("/api/licensing/formula-industrial/grant", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientSubject,
          formulaCode,
          validFrom: from,
          validUntil: until,
        }),
      });
      const data = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        setMsg(typeof data.error === "string" ? data.error : "grant_failed");
        return;
      }
      setMsg("Licença emitida (contrato simulado).");
      setGrants((prev) => [
        {
          id: String(data.id),
          clientSubject,
          formulaCode,
          validFrom: from,
          validUntil: until,
          status: "ACTIVE",
          validity: "VALID",
          grantHash: String(data.grantHash),
          chainAnchor: typeof data.chainAnchor === "string" ? data.chainAnchor : null,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch {
      setMsg("network_error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
      <section className={shell}>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-cyan-200/75">
          Industrial fingerprint
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white md:text-2xl">SHA-256 per formula</h2>
        <p className="mt-2 text-sm text-neutral-400">
          Deterministic from canonical JSON (composition, instructions, COA date). Use for audit trails and
          autonomous agent verification.
        </p>
        <div className="mt-6 space-y-4">
          {fingerprints.map((f) => (
            <article
              key={f.formulaId}
              className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-neutral-200"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-white">{f.name}</p>
                <span className="font-mono text-xs text-amber-200/90">{f.code}</span>
              </div>
              <p className="mt-2 break-all font-mono text-[11px] leading-relaxed text-cyan-100/90">
                {f.securityFingerprintSha256}
              </p>
            </article>
          ))}
        </div>
      </section>

      <aside className="space-y-6">
        <div className={shell}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-amber-200/80">
            Simulated smart contract
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">Mint license</h3>
          <label className="mt-4 block text-xs font-medium uppercase tracking-wider text-neutral-500">
            Client subject
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
            value={clientSubject}
            onChange={(e) => setClientSubject(e.target.value)}
          />
          <label className="mt-3 block text-xs font-medium uppercase tracking-wider text-neutral-500">
            Formula code
          </label>
          <select
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
            value={formulaCode}
            onChange={(e) => setFormulaCode(e.target.value)}
          >
            {fingerprints.map((f) => (
              <option key={f.code} value={f.code}>
                {f.code} — {f.name}
              </option>
            ))}
          </select>
          <label className="mt-3 block text-xs font-medium uppercase tracking-wider text-neutral-500">
            Valid from (local)
          </label>
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
          />
          <label className="mt-3 block text-xs font-medium uppercase tracking-wider text-neutral-500">
            Valid until (local)
          </label>
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void mint()}
            className="mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-300 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black shadow-lg shadow-amber-500/25 transition hover:brightness-110 disabled:opacity-50"
          >
            {busy ? "Minting…" : "Mint license"}
          </button>
          {msg ? <p className="mt-3 text-xs text-neutral-300">{msg}</p> : null}
        </div>

        <div className={shell}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-emerald-200/75">
            On-chain anchors (simulated)
          </p>
          <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto text-xs text-neutral-300">
            {grants.map((g) => (
              <li key={g.id} className="rounded-xl border border-white/10 bg-black/35 p-3">
                <p className="font-mono text-[10px] text-amber-100/90">{g.chainAnchor ?? "—"}</p>
                <p className="mt-1 text-[11px] text-neutral-400">
                  {g.clientSubject} · {g.formulaCode} ·{" "}
                  <span className="text-white/90">{g.validity}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
