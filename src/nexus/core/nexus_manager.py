"""
Orquestrador da Plataforma Nexus.

Carrega perfis de agente (Software, Hardware, Segurança), aplica o protocolo
Lumen Nexos na borda de mensagens e coordena a troca entre ChemVault e
desafios globais.
"""

from __future__ import annotations

import sys
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from types import MappingProxyType
from typing import Any, Protocol, runtime_checkable

LUMEN_NEXOS_VERSION = "1.0"


class AgentProfile(str, Enum):
    SOFTWARE = "software"
    HARDWARE = "hardware"
    SECURITY = "seguranca"


@dataclass(frozen=True)
class LumenNexosEnvelope:
    """Envelope imutável do protocolo Lumen Nexos."""

    channel: str
    payload: Mapping[str, Any]
    version: str = LUMEN_NEXOS_VERSION
    issued_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def with_payload(self, payload: Mapping[str, Any]) -> LumenNexosEnvelope:
        return LumenNexosEnvelope(
            channel=self.channel,
            payload=payload,
            version=self.version,
            issued_at=datetime.now(timezone.utc).isoformat(),
        )


@runtime_checkable
class ChemVaultBridge(Protocol):
    """Contrato mínimo para o ChemVault (implementação real virá depois)."""

    def pull_snapshot(self) -> Mapping[str, Any]: ...
    def apply_outbound(self, envelope: LumenNexosEnvelope) -> None: ...


@runtime_checkable
class NexusAgent(Protocol):
    """Agente Nexus: reage a envelopes e sincroniza com o vault."""

    profile: AgentProfile

    def on_inbound(self, envelope: LumenNexosEnvelope) -> LumenNexosEnvelope: ...
    def on_chemvault_snapshot(
        self, snapshot: Mapping[str, Any]
    ) -> LumenNexosEnvelope: ...


class _ProfileAgent:
    __slots__ = ("profile", "_inbound_tag", "_vault_tag")

    def __init__(
        self,
        profile: AgentProfile,
        inbound_tag: str,
        vault_tag: str,
    ) -> None:
        self.profile = profile
        self._inbound_tag = inbound_tag
        self._vault_tag = vault_tag

    def on_inbound(self, envelope: LumenNexosEnvelope) -> LumenNexosEnvelope:
        merged = {
            "profile": self.profile.value,
            "ingress": self._inbound_tag,
            "echo": dict(envelope.payload),
        }
        return envelope.with_payload(merged)

    def on_chemvault_snapshot(
        self, snapshot: Mapping[str, Any]
    ) -> LumenNexosEnvelope:
        body = {
            "profile": self.profile.value,
            "vault_sync": self._vault_tag,
            "snapshot_keys": tuple(snapshot.keys()),
        }
        return LumenNexosEnvelope(channel="chemvault.nexus.sync", payload=body)


def _build_default_agents() -> dict[AgentProfile, NexusAgent]:
    return {
        AgentProfile.SOFTWARE: _ProfileAgent(
            AgentProfile.SOFTWARE, "code_paths", "formula_index"
        ),
        AgentProfile.HARDWARE: _ProfileAgent(
            AgentProfile.HARDWARE, "sensors_edges", "device_attestation"
        ),
        AgentProfile.SECURITY: AtlasPrime(),
    }


class EncryptedLicensedFormulaBridge:
    """
    Ponte ChemVault → Nexus: expõe apenas fórmulas licenciadas como ciphertext.

    O loader deve retornar linhas com `id`, `ciphertext` (bytes) e `license_id`.
    Nenhum plaintext de fórmula transita por esta camada.
    """

    __slots__ = ("_loader", "_on_outbound")

    def __init__(
        self,
        loader: Callable[[], Sequence[Mapping[str, Any]]],
        on_outbound: Callable[[LumenNexosEnvelope], None] | None = None,
    ) -> None:
        self._loader = loader
        self._on_outbound = on_outbound

    def pull_snapshot(self) -> Mapping[str, Any]:
        formulas: list[dict[str, Any]] = []
        for raw in self._loader():
            cid = raw.get("id")
            ct = raw.get("ciphertext")
            lid = raw.get("license_id")
            if cid is None or ct is None or lid is None:
                raise ValueError("Linha de fórmula requer id, ciphertext e license_id.")
            if not isinstance(ct, (bytes, bytearray)):
                raise TypeError("ciphertext deve ser bytes (material criptografado).")
            formulas.append(
                {
                    "id": str(cid),
                    "encrypted_blob": bytes(ct),
                    "metadata": {
                        "license": str(lid),
                        "vault_transfer": "encrypted-only",
                        "scheme": str(raw.get("scheme", "chemvault-sealed")),
                    },
                }
            )
        return {
            "formulas": tuple(formulas),
            "sealed": True,
            "source": "chemvault.licensed.encrypted",
        }

    def apply_outbound(self, envelope: LumenNexosEnvelope) -> None:
        if self._on_outbound is not None:
            self._on_outbound(envelope)


def _stdout_tty() -> bool:
    return bool(hasattr(sys.stdout, "isatty") and sys.stdout.isatty())


def _stdout_utf8() -> bool:
    enc = (getattr(sys.stdout, "encoding", None) or "").lower()
    return "utf" in enc


def _rgb(r: int, g: int, b: int) -> str:
    if not _stdout_tty() or not _stdout_utf8():
        return ""
    return f"\033[38;2;{r};{g};{b}m"


def _style(dim: bool = False, bold: bool = False) -> str:
    if not _stdout_tty() or not _stdout_utf8():
        return ""
    parts = []
    if dim:
        parts.append("2")
    if bold:
        parts.append("1")
    if not parts:
        return ""
    return f"\033[{';'.join(parts)}m"


_RESET = "\033[0m" if _stdout_tty() and _stdout_utf8() else ""


def _glass_line(inner_width: int, text: str, *, edge: tuple[str, str]) -> str:
    left, right = edge
    pad = max(0, inner_width - len(text))
    return f"{left} {text}{' ' * pad} {right}"


def _safe_print(text: str) -> None:
    """Evita UnicodeEncodeError em consoles cp1252 / latin-1."""
    try:
        print(text, file=sys.stdout)
    except UnicodeEncodeError:
        enc = getattr(sys.stdout, "encoding", None) or "utf-8"
        print(text.encode(enc, errors="replace").decode(enc), file=sys.stdout)


def _log_lumen_nexos_operational_banner() -> None:
    """Console estilo glass: vidro fosco, bordas suaves, hierarquia clara."""
    w = 58
    frost = _rgb(210, 230, 255)
    title = _style(bold=True) + frost
    dim = _style(dim=True) + _rgb(170, 190, 215)
    use_uni = _stdout_tty() and _stdout_utf8()
    if use_uni:
        top = "\u256d" + "\u2500" * w + "\u256e"
        bot = "\u2570" + "\u2500" * w + "\u256f"
        edge = ("\u2502", "\u2502")
    else:
        top = "+" + "-" * w + "+"
        bot = "+" + "-" * w + "+"
        edge = ("|", "|")

    op_label = "OPERAÇÃO ATIVA" if use_uni else "OPERACAO ATIVA"
    lines = [
        "",
        top,
        _glass_line(
            w - 2,
            f"{title}LUMEN NEXOS{_RESET}{frost}: {op_label}{_RESET}",
            edge=edge,
        ),
        _glass_line(
            w - 2,
            f"{dim}protocolo seguro | borda Nexus | ChemVault selado{_RESET}",
            edge=edge,
        ),
        bot,
        "",
    ]
    _safe_print("\n".join(lines))


def _log_startup_glass_prelude() -> None:
    w = 58
    edge_c = _rgb(165, 195, 230)
    body = _rgb(200, 220, 245)
    if not _stdout_tty():
        print("[Nexus] startup_sequence - verificacao de agentes", file=sys.stdout)
        return
    if _stdout_utf8():
        bar = "\u254d" * (w - 8)
        left, mid, right = "\u256d", "\u2502", "\u2570"
        tail = "\u257c"
    else:
        bar = "-" * (w - 8)
        left, mid, right = "+", "|", "+"
        tail = "-"
    _safe_print(
        f"\n{edge_c}{left}{bar}{tail}{_RESET}\n"
        f"{edge_c}{mid}{_RESET} {body}Nexus / sequencia de arranque{_RESET}\n"
        f"{edge_c}{right}{bar}{tail}{_RESET}",
    )


def _log_agent_row(profile: AgentProfile, ok: bool, detail: str) -> None:
    if not _stdout_tty():
        status = "OK" if ok else "FALHA"
        print(f"  [{status}] {profile.value} - {detail}", file=sys.stdout)
        return
    pill = _rgb(130, 220, 180) if ok else _rgb(255, 120, 140)
    tag = "PASS" if ok else "FAIL"
    dim = _style(dim=True) + _rgb(160, 180, 205)
    mark = "\u258e " if _stdout_utf8() else "> "
    line = (
        f"  {pill}{mark}{tag}{_RESET}  {_style(bold=True)}{profile.value:10}{_RESET}  "
        f"{dim}{detail}{_RESET}"
    )
    _safe_print(line)


def startup_sequence(manager: NexusManager) -> dict[AgentProfile, bool]:
    """
    Executa verificação sintética em todos os agentes registrados (roster ativo).

    Envia um ping `nexus.system.startup` para cada agente e valida resposta.
    Emite painel glass no console e o banner LUMEN NEXOS operacional.
    """
    _log_startup_glass_prelude()
    ping = LumenNexosEnvelope(
        "nexus.system.startup",
        {"phase": "self_test", "ts": datetime.now(timezone.utc).isoformat()},
    )
    results: dict[AgentProfile, bool] = {}
    for profile, agent in manager.registered_agents.items():
        detail = ""
        ok = False
        try:
            out = agent.on_inbound(ping)
            ok = isinstance(out, LumenNexosEnvelope) and bool(out.channel)
            detail = out.channel if ok else "resposta invalida"
        except Exception as exc:  # noqa: BLE001 — check de arranque deve ser total
            detail = f"{type(exc).__name__}: {exc}"
        results[profile] = ok
        _log_agent_row(profile, ok, detail)

    _log_lumen_nexos_operational_banner()
    return results


class NexusManager:
    """
    Orquestra perfis, ponte ChemVault e canais globais via Lumen Nexos.
    """

    def __init__(
        self,
        chemvault: ChemVaultBridge | None = None,
        agents: dict[AgentProfile, NexusAgent] | None = None,
    ) -> None:
        self._chemvault = chemvault
        self._agents = agents or _build_default_agents()
        self._active: AgentProfile | None = None
        self._listeners: list[Callable[[LumenNexosEnvelope], None]] = []

    @property
    def registered_agents(self) -> Mapping[AgentProfile, NexusAgent]:
        """Mapa imutável de todos os agentes disponíveis (check de startup)."""
        return MappingProxyType(self._agents)

    @property
    def active_profile(self) -> AgentProfile | None:
        return self._active

    def load_profile(self, profile: AgentProfile) -> NexusAgent:
        if profile not in self._agents:
            raise KeyError(f"Perfil não registrado: {profile}")
        self._active = profile
        return self._agents[profile]

    def subscribe_global(self, fn: Callable[[LumenNexosEnvelope], None]) -> None:
        self._listeners.append(fn)

    def _emit_global(self, envelope: LumenNexosEnvelope) -> None:
        for fn in self._listeners:
            fn(envelope)

    def route_from_global_challenge(self, envelope: LumenNexosEnvelope) -> LumenNexosEnvelope:
        if self._active is None:
            raise RuntimeError("Nenhum perfil ativo; chame load_profile antes.")
        agent = self._agents[self._active]
        out = agent.on_inbound(envelope)
        if self._chemvault is not None:
            self._chemvault.apply_outbound(out)
        self._emit_global(out)
        return out

    def pull_chemvault_and_broadcast(self) -> LumenNexosEnvelope:
        if self._active is None:
            raise RuntimeError("Nenhum perfil ativo; chame load_profile antes.")
        if self._chemvault is None:
            raise RuntimeError("ChemVaultBridge não configurado.")
        agent = self._agents[self._active]
        snapshot = self._chemvault.pull_snapshot()
        out = agent.on_chemvault_snapshot(snapshot)
        self._emit_global(out)
        return out


from ..agents.atlas_prime import AtlasPrime  # noqa: E402 — após tipos para evitar ciclo
