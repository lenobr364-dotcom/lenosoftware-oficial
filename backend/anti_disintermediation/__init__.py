"""Anti-desintermediação no fluxo existente (frota / mensagens / Pix)."""

from .contact_sanitize import mask_contact_text, sanitize_user_input
from .exclusivity import EXPECTED_LENO_CNPJ, is_expected_leno_cnpj

__all__ = [
    "mask_contact_text",
    "sanitize_user_input",
    "EXPECTED_LENO_CNPJ",
    "is_expected_leno_cnpj",
]
