"""
Omega_System — base para serviços Google Cloud (Storage, Vertex AI / Gemini, Monitoring).

ChemVault Global · parceria Leno César & Lumen Onel.

Configurar variáveis de ambiente (espelho do Next.js):
  GOOGLE_CLOUD_PROJECT
  GOOGLE_CLOUD_REGION (opcional)

Em produção: Application Default Credentials ou conta de serviço com escopos mínimos.
"""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass
class GcpBootstrap:
    project_id: str | None
    region: str | None

    @classmethod
    def from_env(cls) -> "GcpBootstrap":
        return cls(
            project_id=os.getenv("GOOGLE_CLOUD_PROJECT", "").strip() or None,
            region=os.getenv("GOOGLE_CLOUD_REGION", "").strip() or None,
        )

    def is_linked(self) -> bool:
        return self.project_id is not None
