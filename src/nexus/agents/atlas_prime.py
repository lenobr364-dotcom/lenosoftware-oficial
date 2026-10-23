"""
Atlas Prime — especialista em infraestrutura e segurança da Plataforma Nexus.

Sanitização de fórmulas ChemVault, integridade do Desafio 1 e handshake Lumen
para relatórios de status em tempo real.
"""

from __future__ import annotations

import hmac
import secrets
from collections.abc import Callable, Iterable, Mapping, MutableMapping, Sequence
from hashlib import sha256
from typing import Any

from ..core.nexus_manager import AgentProfile, LumenNexosEnvelope

# Canais e constantes estáveis (evita alocação por comparação)
CH_DESAFIO1 = "global.desafio1"
CH_LUMEN_STATUS = "lumen.operator.status"
CH_LUMEN_HANDSHAKE = "lumen.operator.handshake"
_ALLOWED_FORMULA_KEYS: frozenset[str] = frozenset(
    {"id", "slug", "hash", "encrypted_blob", "metadata", "version"}
)


class AtlasPrime:
    """
    Agente de borda: prepara dados do vault, veda o Desafio 1 e fala com a Lumen.
    """

    __slots__ = (
        "profile",
        "_lumen_listeners",
        "_desafio1_baseline",
        "_handshake_secret",
        "_lumen_nonce",
        "_lumen_verified",
    )

    profile: AgentProfile

    def __init__(self, handshake_secret: bytes | None = None) -> None:
        self.profile = AgentProfile.SECURITY
        self._lumen_listeners: list[Callable[[LumenNexosEnvelope], None]] = []
        self._desafio1_baseline: bytes | None = None
        self._handshake_secret: bytes = handshake_secret or secrets.token_bytes(32)
        self._lumen_nonce: str | None = None
        self._lumen_verified: bool = False

    # --- Sanitização (alta taxa: só chaves permitidas, sem deepcopy) ---

    def sanitize_formulas_for_nexus(
        self,
        formulas: Iterable[Mapping[str, Any]],
    ) -> tuple[dict[str, Any], ...]:
        """
        Remove campos não autorizados e normaliza entradas para consumo Nexus.

        Retorna tupla imutável de dicts leves (somente chaves em
        _ALLOWED_FORMULA_KEYS). Valores não escalares em metadata são
        descartados no primeiro nível para reduzir superfície.
        """
        out: list[dict[str, Any]] = []
        for row in formulas:
            item: dict[str, Any] = {}
            for k in _ALLOWED_FORMULA_KEYS:
                if k not in row:
                    continue
                v = row[k]
                if k == "metadata" and isinstance(v, Mapping):
                    meta = {sk: sv for sk, sv in v.items() if isinstance(sv, (str, int, float, bool))}
                    item[k] = meta
                elif isinstance(v, (str, int, float, bool)) or v is None:
                    item[k] = v
                elif k == "encrypted_blob" and isinstance(v, (bytes, bytearray)):
                    item[k] = bytes(v)
            if item:
                out.append(item)
        return tuple(out)

    def sanitize_snapshot_for_nexus(
        self, snapshot: Mapping[str, Any]
    ) -> dict[str, Any]:
        """Extrai e sanitiza listas de fórmulas presentes no snapshot ChemVault."""
        raw = snapshot.get("formulas")
        if isinstance(raw, Sequence) and not isinstance(raw, (str, bytes, dict)):
            formulas = [x for x in raw if isinstance(x, Mapping)]
            safe = self.sanitize_formulas_for_nexus(formulas)
            return {"formulas": safe, "formula_count": len(safe)}
        return {"formulas": (), "formula_count": 0}

    # --- Integridade Desafio 1 ---

    @staticmethod
    def _fingerprint_payload(payload: Mapping[str, Any]) -> bytes:
        """Digest determinístico O(n) sobre pares ordenados (chave estável)."""
        parts: list[bytes] = []
        for k in sorted(payload.keys()):
            parts.append(k.encode())
            parts.append(b"\x00")
            v = payload[k]
            if isinstance(v, Mapping):
                parts.append(AtlasPrime._fingerprint_payload(v))
            elif isinstance(v, (bytes, bytearray)):
                parts.append(bytes(v))
            else:
                parts.append(repr(v).encode())
            parts.append(b"\x01")
        return sha256(b"".join(parts)).digest()

    def arm_desafio1(self, trusted_payload: Mapping[str, Any]) -> bytes:
        """Define linha de base criptográfica antes do processamento do Desafio 1."""
        fp = self._fingerprint_payload(trusted_payload)
        self._desafio1_baseline = fp
        return fp

    def monitor_desafio1_integrity(self, envelope: LumenNexosEnvelope) -> bool:
        """
        Retorna True se o envelope do Desafio 1 ainda corresponde à linha armada.

        Qualquer divergência em payload (interferência externa) retorna False.
        Envelopes de outros canais são ignorados (True).
        """
        if envelope.channel != CH_DESAFIO1:
            return True
        if self._desafio1_baseline is None:
            return False
        current = self._fingerprint_payload(dict(envelope.payload))
        return hmac.compare_digest(current, self._desafio1_baseline)

    # --- Handshake Lumen (relatórios diretos ao operador) ---

    def lumen_register(self, callback: Callable[[LumenNexosEnvelope], None]) -> None:
        """Registra callback síncrono para status em tempo real (baixa latência)."""
        self._lumen_listeners.append(callback)

    def lumen_begin_handshake(self) -> LumenNexosEnvelope:
        """Inicia sessão Lumen; operador deve ecoar o nonce assinado."""
        self._lumen_nonce = secrets.token_urlsafe(16)
        self._lumen_verified = False
        body = {"phase": "challenge", "nonce": self._lumen_nonce}
        return LumenNexosEnvelope(channel=CH_LUMEN_HANDSHAKE, payload=body)

    @staticmethod
    def sign_lumen_nonce(secret: bytes, nonce: str) -> str:
        """Gera o token esperado por `lumen_complete_handshake` (lado operador)."""
        return hmac.new(secret, msg=nonce.encode(), digestmod=sha256).hexdigest()

    def lumen_complete_handshake(self, response: LumenNexosEnvelope) -> bool:
        """Valida resposta do operador contra o segredo local (comparação em tempo constante)."""
        if response.channel != CH_LUMEN_HANDSHAKE:
            return False
        nonce = response.payload.get("nonce")
        token = response.payload.get("token")
        if not isinstance(nonce, str) or not isinstance(token, str) or nonce != self._lumen_nonce:
            self._lumen_verified = False
            return False
        expected = hmac.new(
            self._handshake_secret,
            msg=nonce.encode(),
            digestmod=sha256,
        ).hexdigest()
        ok = hmac.compare_digest(token, expected)
        self._lumen_verified = ok
        return ok

    def lumen_emit_status(
        self,
        *,
        phase: str,
        detail: Mapping[str, Any],
    ) -> LumenNexosEnvelope:
        """Monta envelope de status e notifica ouvintes registrados."""
        body: dict[str, Any] = {
            "phase": phase,
            "verified": self._lumen_verified,
            "detail": dict(detail),
        }
        env = LumenNexosEnvelope(channel=CH_LUMEN_STATUS, payload=body)
        for cb in self._lumen_listeners:
            cb(env)
        return env

    @property
    def lumen_session_ready(self) -> bool:
        return self._lumen_verified

    # --- NexusAgent (orquestrador) ---

    def on_inbound(self, envelope: LumenNexosEnvelope) -> LumenNexosEnvelope:
        if envelope.channel == CH_DESAFIO1:
            ok = self.monitor_desafio1_integrity(envelope)
            payload: MutableMapping[str, Any] = {
                "profile": self.profile.value,
                "desafio1_ok": ok,
                "forward": dict(envelope.payload) if ok else {},
            }
            if not ok:
                self.lumen_emit_status(phase="integrity_alert", detail={"channel": CH_DESAFIO1})
            return LumenNexosEnvelope(channel="nexus.security.inbound", payload=payload)
        merged = {
            "profile": self.profile.value,
            "ingress": "threat_surface",
            "echo": dict(envelope.payload),
        }
        return envelope.with_payload(merged)

    def on_chemvault_snapshot(self, snapshot: Mapping[str, Any]) -> LumenNexosEnvelope:
        safe = self.sanitize_snapshot_for_nexus(snapshot)
        self.lumen_emit_status(
            phase="vault_sanitized",
            detail={"formula_count": safe["formula_count"]},
        )
        body = {
            "profile": self.profile.value,
            "vault_sync": "policy_ledger",
            "nexus_ready": safe,
        }
        return LumenNexosEnvelope(channel="chemvault.nexus.sync", payload=body)
