"""
Launcher na raiz do repositório para tarefas/launch que usam::

    python "${workspaceFolder}/main_nexus.py"

O pacote Nexus vive em ``src/nexus/``; este script apenas ajusta ``sys.path``.
"""

from __future__ import annotations

import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent
_SRC = _ROOT / "src"
if _SRC.is_dir() and str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from nexus.main_nexus import main  # noqa: E402

if __name__ == "__main__":
    main()
