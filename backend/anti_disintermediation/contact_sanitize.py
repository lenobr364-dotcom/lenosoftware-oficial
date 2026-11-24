from __future__ import annotations

import re
from dataclasses import dataclass

CONTACT_MASK = "[contato oculto pela plataforma]"
LINK_MASK = "[link externo bloqueado]"
HANDLE_MASK = "[perfil social oculto]"

PHONE_PATTERN = re.compile(
    r"(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,3}\)?[\s.-]?)?\d{4,5}[\s.-]?\d{4}\b|(?:\+?\d{1,3}[\s.-]?)?\d{8,15}\b"
)
WHATSAPP_PATTERN = re.compile(
    r"(?:whats?\s*app|zap|wpp|wa\.me|api\.whatsapp\.com)[\s:/]*(?:\+?\d[\d\s().-]{7,}\d)?",
    re.IGNORECASE,
)
EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
SOCIAL_HANDLE_PATTERN = re.compile(r"(^|[\s(,;:])@([a-zA-Z0-9._]{2,30})\b")
EXTERNAL_LINK_PATTERN = re.compile(r"(?:https?://|www\.)[^\s<>'\"]+", re.IGNORECASE)
SOCIAL_URL_HINT_PATTERN = re.compile(
    r"(?:instagram|telegram|facebook|fb\.com|linkedin|tiktok|t\.me)[\s.:/]+[^\s<>'\"]+",
    re.IGNORECASE,
)


@dataclass
class SanitizeResult:
    original: str
    sanitized: str
    blocked: bool
    changed: bool


def mask_contact_text(input_text: str | None) -> SanitizeResult:
    original = input_text or ""
    sanitized = original
    hits = 0

    def _sub(pattern: re.Pattern[str], repl: str, text: str) -> str:
        nonlocal hits
        new_text, n = pattern.subn(repl, text)
        hits += n
        return new_text

    sanitized = _sub(WHATSAPP_PATTERN, CONTACT_MASK, sanitized)
    sanitized = _sub(EMAIL_PATTERN, CONTACT_MASK, sanitized)
    sanitized = _sub(EXTERNAL_LINK_PATTERN, LINK_MASK, sanitized)
    sanitized = _sub(SOCIAL_URL_HINT_PATTERN, LINK_MASK, sanitized)
    sanitized = _sub(PHONE_PATTERN, CONTACT_MASK, sanitized)

    def _handle(match: re.Match[str]) -> str:
        nonlocal hits
        hits += 1
        return f"{match.group(1)}{HANDLE_MASK}"

    sanitized = SOCIAL_HANDLE_PATTERN.sub(_handle, sanitized)

    return SanitizeResult(
        original=original,
        sanitized=sanitized,
        blocked=hits > 0,
        changed=sanitized != original,
    )


def sanitize_user_input(input_text: str | None, mode: str = "mask") -> SanitizeResult:
    result = mask_contact_text(input_text)
    if mode == "reject" and result.blocked:
        return SanitizeResult(original=result.original, sanitized="", blocked=True, changed=True)
    return result
