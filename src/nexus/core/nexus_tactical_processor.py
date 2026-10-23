"""
Nexus Tactical Processor — ambiente de simulação do Desafio 1 (Planeta).

Marco zero (v0)
================
Este módulo formaliza o **primeiro anel de confiança** entre dados táticos de
grande escala, o protocolo Lumen Nexos e a superfície de segurança Atlas.
Ele não persiste estado global da Plataforma Nexus: toda a carga útil transita
por um **isolamento lógico** explicitamente delimitado, preparando a evolução
para workers dedicados, filas e fronteiras de rede sem reescrever o contrato
semântico aqui estabelecido.

Escopo funcional
----------------
1. **Desafio global nº 1**: simulação determinística sobre *streams* táticos.
2. **Sandboxing**: processamento em *chunks* com memória de trabalho acotada,
   cópias defensivas mínimas por lote e **zero escrita** em sistema de arquivos
   por omissão (superfície reduzida para auditoria e CI).
3. **Atlas Prime**: cada lote é **armado** e **lacrado** via
   :meth:`~nexus.agents.atlas_prime.AtlasPrime.arm_desafio1` e validado com
   :meth:`~nexus.agents.atlas_prime.AtlasPrime.monitor_desafio1_integrity`
   sobre envelopes ``global.desafio1``.

Extensão prevista
-----------------
* Substituição do motor de *chunk* por *multiprocessing* ou contêiner OCI.
* Plug-in de política por ``mission_profile`` sem alterar a assinatura pública
  de :func:`execute_global_challenge_01`.

Desafio Global 01 — parâmetros e modo SILENT
-------------------------------------------
* **GLOBAL_TARGET_01**: variável de ambiente com JSON dos parâmetros do
  problema planetário (consumido por :func:`predictive_analysis_from_formulas`).
* **NEXUS_CHALLENGE01_VAULT**: caminho opcional de arquivo exclusivo do Vault;
  toda telemetria narrativa (incl. barra de progresso) é escrita **apenas** aqui
  e na lista interna do *sink*. Não utiliza o módulo ``logging`` nem
  ``stdout``/``stderr``, evitando rastros em agregadores externos.
"""

from __future__ import annotations

import json
import os
from collections.abc import Iterable, Iterator, Mapping, Sequence
from dataclasses import dataclass, field
from hashlib import sha256
from typing import TYPE_CHECKING, Any, TextIO

from .nexus_manager import LumenNexosEnvelope

if TYPE_CHECKING:
    from ..agents.atlas_prime import AtlasPrime

# Alinhado a nexus.agents.atlas_prime.CH_DESAFIO1 (evita import circular no load).
_CH_DESAFIO1_CHANNEL = "global.desafio1"

ENV_GLOBAL_TARGET_01 = "GLOBAL_TARGET_01"
"""Nome da variável de ambiente com JSON dos parâmetros planetários do DG-01."""

ENV_CHALLENGE01_VAULT = "NEXUS_CHALLENGE01_VAULT"
"""Arquivo exclusivo do Vault para trilhas SILENT (sem logging padrão)."""


# --- Modo SILENT / Vault ----------------------------------------------------


class OperationVaultSink:
    """
    Canal único de observabilidade para o Desafio Global 01.

    **SILENT**: não emite para ``logging``, ``print`` ou *handlers* externos;
    apenas concatena linhas em memória e, se configurado, anexa ao arquivo
    indicado por :envvar:`NEXUS_CHALLENGE01_VAULT`.
    """

    __slots__ = ("_fh", "_path", "lines")

    def __init__(self, vault_path: str | None) -> None:
        self._path = vault_path
        self.lines: list[str] = []
        self._fh: TextIO | None = None
        if vault_path:
            try:
                self._fh = open(vault_path, "a", encoding="utf-8")
            except OSError:
                self._fh = None

    @classmethod
    def from_environment(cls) -> OperationVaultSink:
        return cls(os.environ.get(ENV_CHALLENGE01_VAULT))

    def close(self) -> None:
        if self._fh is not None:
            self._fh.close()
            self._fh = None

    def __enter__(self) -> OperationVaultSink:
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()

    def emit(self, line: str) -> None:
        self.lines.append(line)
        if self._fh is not None:
            self._fh.write(line + "\n")
            self._fh.flush()


def load_global_target_01() -> dict[str, Any]:
    """
    Lê e faz o parse de :envvar:`GLOBAL_TARGET_01` como JSON.

    String vazia ou JSON inválido resultam em ``{}`` (sem exceção), adequado
    a pipelines que ainda não depositaram o alvo planetário.
    """
    raw = os.environ.get(ENV_GLOBAL_TARGET_01, "").strip()
    if not raw:
        return {}
    try:
        out = json.loads(raw)
    except json.JSONDecodeError:
        return {}
    return out if isinstance(out, dict) else {}


def _stylized_progress_bar(
    label: str,
    *,
    current: int,
    total: int,
    width: int = 26,
) -> str:
    """Barra estilizada (blocos densos + sombra) escrita apenas no Vault."""
    total = max(1, total)
    pct = min(100.0, max(0.0, 100.0 * current / total))
    filled = int(round((width * current) / total))
    filled = min(width, max(0, filled))
    inner = "\u2588" * filled + "\u2591" * (width - filled)
    return f"  {label[:14]:14} |{inner}| {pct:5.1f}%  ({current}/{total})"


# --- Contratos táticos ------------------------------------------------------


@dataclass(frozen=True, slots=True)
class TacticalChallenge01Input:
    """
    Pacote de entrada do Desafio 1.

    ``step_seals`` deve alinhar 1:1 com os lotes emitidos pelo *sandbox*
    (um selo por chunk, na ordem). Cada selo é o mapa canônico que Atlas
    esperará após o processamento isolado daquele lote.
    """

    mission_id: str
    record_stream: Iterable[Mapping[str, Any]]
    step_seals: Sequence[Mapping[str, Any]]
    chunk_size: int = 50_000


@dataclass(slots=True)
class TacticalBatchDigest:
    """Resumo criptográfico de um lote (não armazena o lote completo)."""

    step_index: int
    record_count: int
    ledger_digest: str


@dataclass(slots=True)
class Challenge01Result:
    """Resultado agregado da execução (adequado para telemetria / Lumen)."""

    mission_id: str
    success: bool
    batches: tuple[TacticalBatchDigest, ...] = field(default_factory=tuple)
    error_step: int | None = None
    error_detail: str | None = None


@dataclass(slots=True)
class PredictiveScenario:
    """Um cenário sintético derivado do corpus de fórmulas e do alvo planetário."""

    index: int
    aggregate_score: float
    signal_fingerprint: str


@dataclass(slots=True)
class PredictiveAnalysisReport:
    """Saída da análise preditiva (scores apenas; sem vazamento de *blobs*)."""

    formula_count: int
    corpus_fingerprint: str
    scenario_steps: int
    scenarios: tuple[PredictiveScenario, ...]
    vault_transcript: tuple[str, ...]
    target_params: dict[str, Any]


# --- Sandbox ---------------------------------------------------------------


def _shallow_frozen_row(row: Mapping[str, Any]) -> dict[str, Any]:
    """Cópia defensiva superficial para o lote (isolamento do stream externo)."""
    out: dict[str, Any] = {}
    for k, v in row.items():
        if isinstance(v, (str, int, float, bool)) or v is None:
            out[str(k)] = v
        elif isinstance(v, (bytes, bytearray)):
            out[str(k)] = bytes(v)
        elif isinstance(v, Mapping):
            out[str(k)] = dict(v)
        else:
            out[str(k)] = repr(v)
    return out


class Desafio01Sandbox:
    """
    Isolamento de execução para o Desafio 1.

    **Garantias de projeto (v0)**

    * Memória: apenas até ``chunk_size`` registros materializados por vez.
    * Efeitos colaterais: nenhuma I/O de disco na implementação base.
    * Estado: contadores e *digests* locais; referências ao *stream* original
      não são retidas após o consumo de cada lote.

    **Limitações declaradas**

    Isolamento **lógico** no mesmo processo Python não equivale a separação
    de kernel. Para ameaças de código hostil dentro de ``record_stream``,
    defenda-se com *hard* sandbox (processo/contêiner) na camada de orquestração.
    """

    __slots__ = ("chunk_size", "_mission_id")

    def __init__(self, mission_id: str, *, chunk_size: int) -> None:
        self._mission_id = mission_id
        self.chunk_size = max(1, int(chunk_size))

    def iter_batches(
        self, record_stream: Iterable[Mapping[str, Any]]
    ) -> Iterator[list[dict[str, Any]]]:
        """
        Particiona o *stream* em lotes mutáveis locais (descartáveis).

        Cada lote é uma lista nova; após o consumo pelo chamador, o GC pode
        reclamar o pico de memória antes do próximo lote.
        """
        it = iter(record_stream)
        while True:
            batch: list[dict[str, Any]] = []
            try:
                for _ in range(self.chunk_size):
                    batch.append(_shallow_frozen_row(next(it)))
            except StopIteration:
                if batch:
                    yield batch
                break
            yield batch

    @staticmethod
    def ledger_digest_for_batch(
        mission_id: str, step_index: int, batch: Sequence[Mapping[str, Any]]
    ) -> str:
        """
        Digest determinístico O(n) sobre o lote (ordenado por chave interna).

        Usado para compor o mapa lacrado verificado pelo Atlas sem serializar
        o volume completo fora do *sandbox*.
        """
        h = sha256()
        h.update(mission_id.encode())
        h.update(b"\x00")
        h.update(str(step_index).encode())
        h.update(b"\x00")
        for row in batch:
            for k in sorted(row.keys()):
                h.update(k.encode())
                h.update(b"\x1f")
                v = row[k]
                if isinstance(v, (bytes, bytearray)):
                    h.update(bytes(v))
                else:
                    h.update(repr(v).encode())
                h.update(b"\x1e")
        return h.hexdigest()

    def build_step_payload(
        self, step_index: int, batch: Sequence[Mapping[str, Any]]
    ) -> dict[str, Any]:
        """Monta o mapa canônico do lote após processamento isolado."""
        digest = self.ledger_digest_for_batch(self._mission_id, step_index, batch)
        return {
            "mission_id": self._mission_id,
            "challenge": "planeta.desafio_01",
            "step": step_index,
            "record_count": len(batch),
            "ledger_digest": digest,
        }


def predictive_analysis_from_formulas(
    formulas: Iterable[Mapping[str, Any]],
    *,
    vault: OperationVaultSink | None = None,
) -> PredictiveAnalysisReport:
    """
    Análise preditiva para o Desafio Global 01: simula cenários a partir do
    **corpus** de fórmulas ChemVault usando apenas identificadores e *hashes*
    públicos — nunca materializa ou registra ``encrypted_blob``.

    **Parâmetros planetários** vêm de :envvar:`GLOBAL_TARGET_01` (JSON), p.ex.::

        {"scenario_steps": 24, "stress": 0.08}

    **Modo SILENT**: não usa o módulo ``logging`` nem ``stdout``/``stderr``;
    barra de progresso e trilhas vão somente para :class:`OperationVaultSink`
    (memória + arquivo opcional :envvar:`NEXUS_CHALLENGE01_VAULT`).
    """
    owned = vault is None
    sink = vault or OperationVaultSink.from_environment()
    try:
        target = load_global_target_01()
        steps = max(1, min(256, int(float(target.get("scenario_steps", 16)))))
        seed_salt = json.dumps(target, sort_keys=True, separators=(",", ":")).encode()

        sink.emit("[DG01][SILENT/Vault] ingest: fingerprinting corpus (no blob logging)")
        h = sha256()
        h.update(seed_salt)
        n = 0
        for row in formulas:
            n += 1
            for key in ("id", "slug", "hash", "version"):
                if key in row:
                    h.update(str(row[key]).encode())
                    h.update(b"\x1f")
            h.update(b"\x1e")
        corpus_fp = h.hexdigest()
        sink.emit(
            f"[DG01][SILENT/Vault] ingest: sealed n={n} fp_prefix={corpus_fp[:16]}"
        )

        scenarios: list[PredictiveScenario] = []
        for t in range(1, steps + 1):
            sink.emit(_stylized_progress_bar("DG01-SOLVE", current=t, total=steps))
            z = sha256()
            z.update(seed_salt)
            z.update(corpus_fp.encode())
            z.update(str(t).encode())
            raw = int.from_bytes(z.digest()[:8], "big")
            score = (raw % 10_000_000) / 1_000_000.0 - 5.0
            stress = float(target.get("stress", 0.0))
            score = score * (1.0 + stress)
            scenarios.append(
                PredictiveScenario(
                    index=t,
                    aggregate_score=round(score, 4),
                    signal_fingerprint=z.hexdigest()[:24],
                )
            )

        sink.emit(
            "[DG01][SILENT/Vault] predictive horizon closed -- traces vault-local only"
        )
        return PredictiveAnalysisReport(
            formula_count=n,
            corpus_fingerprint=corpus_fp,
            scenario_steps=steps,
            scenarios=tuple(scenarios),
            vault_transcript=tuple(sink.lines),
            target_params=dict(target),
        )
    finally:
        if owned:
            sink.close()


# --- Orquestração pública ---------------------------------------------------


def execute_global_challenge_01(
    *,
    atlas: "AtlasPrime",
    tactical_inputs: TacticalChallenge01Input,
    vault: OperationVaultSink | None = None,
) -> Challenge01Result:
    """
    Executa o **Desafio global nº 1** sob *sandbox* com validação Atlas por etapa.

    Para cada lote ``i``:

    1. ``atlas.arm_desafio1(tactical_inputs.step_seals[i])`` fixa a linha de base.
    2. O *sandbox* calcula o *payload* canônico a partir dos registros do lote.
    3. Exige igualdade estrutural ``payload == step_seals[i]`` (coerência semântica).
    4. Emite ``LumenNexosEnvelope("global.desafio1", payload)`` e confere
       :meth:`~nexus.agents.atlas_prime.AtlasPrime.monitor_desafio1_integrity`.

    Falhas em qualquer etapa interrompem a cadeia e retornam diagnóstico
    auditável sem propagar exceções não tratadas ao chamador.

    **SILENT**: se ``vault`` for informado, marcos vão apenas para o Vault
    (nunca para ``logging`` ou consoles padrão).
    """
    mission = tactical_inputs.mission_id
    sandbox = Desafio01Sandbox(mission, chunk_size=tactical_inputs.chunk_size)
    digests: list[TacticalBatchDigest] = []
    step_idx = 0

    for batch in sandbox.iter_batches(tactical_inputs.record_stream):
        if step_idx >= len(tactical_inputs.step_seals):
            if vault is not None:
                vault.emit("[DG01][SILENT/Vault] ABORT reason=seal_shortage")
            return Challenge01Result(
                mission_id=mission,
                success=False,
                batches=tuple(digests),
                error_step=step_idx,
                error_detail="Menos selos do que lotes produzidos pelo stream.",
            )

        expected = tactical_inputs.step_seals[step_idx]
        atlas.arm_desafio1(expected)

        payload = sandbox.build_step_payload(step_idx, batch)
        if payload != dict(expected):
            if vault is not None:
                vault.emit(
                    f"[DG01][SILENT/Vault] ABORT step={step_idx} "
                    "reason=payload_divergence"
                )
            return Challenge01Result(
                mission_id=mission,
                success=False,
                batches=tuple(digests),
                error_step=step_idx,
                error_detail="Payload do lote diverge do selo tático (integridade).",
            )

        envelope = LumenNexosEnvelope(_CH_DESAFIO1_CHANNEL, payload)
        if not atlas.monitor_desafio1_integrity(envelope):
            if vault is not None:
                vault.emit(
                    f"[DG01][SILENT/Vault] ABORT step={step_idx} "
                    "reason=atlas_rejected_envelope"
                )
            return Challenge01Result(
                mission_id=mission,
                success=False,
                batches=tuple(digests),
                error_step=step_idx,
                error_detail="Atlas rejeitou o envelope global.desafio1.",
            )

        digests.append(
            TacticalBatchDigest(
                step_index=step_idx,
                record_count=len(batch),
                ledger_digest=payload["ledger_digest"],
            )
        )
        if vault is not None:
            d = payload["ledger_digest"]
            vault.emit(
                f"[DG01][SILENT/Vault] batch_ok step={step_idx} "
                f"records={len(batch)} digest={d[:16]}"
            )
        step_idx += 1
        del batch

    if step_idx != len(tactical_inputs.step_seals):
        if vault is not None:
            vault.emit("[DG01][SILENT/Vault] ABORT reason=seal_surplus")
        return Challenge01Result(
            mission_id=mission,
            success=False,
            batches=tuple(digests),
            error_step=step_idx,
            error_detail="Sobraram selos sem lotes correspondentes.",
        )

    if vault is not None:
        vault.emit(
            f"[DG01][SILENT/Vault] mission_complete mission_id={mission} "
            f"batches={step_idx}"
        )
    return Challenge01Result(
        mission_id=mission,
        success=True,
        batches=tuple(digests),
    )


def precompute_step_seals(
    mission_id: str,
    record_stream: Iterable[Mapping[str, Any]],
    *,
    chunk_size: int = 50_000,
) -> tuple[dict[str, Any], ...]:
    """
    Utilitário de planejamento: gera a sequência de selos alinhada ao *stream*.

    Use em ambiente de confiança para construir ``TacticalChallenge01Input.step_seals``
    antes da execução em produção. O *digest* é determinístico dado o mesmo
    particionamento e ``mission_id``.
    """
    sandbox = Desafio01Sandbox(mission_id, chunk_size=chunk_size)
    seals: list[dict[str, Any]] = []
    for i, batch in enumerate(sandbox.iter_batches(record_stream)):
        seals.append(sandbox.build_step_payload(i, batch))
    return tuple(seals)
