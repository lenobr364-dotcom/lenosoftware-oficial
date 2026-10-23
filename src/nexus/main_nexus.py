"""
Ponto de entrada interativo da Plataforma Nexus (console tático).

Executar a partir da raiz do repositório com ``src`` no PYTHONPATH::

    python -m nexus.main_nexus
"""

from __future__ import annotations

import os
import sys

from .core import nexus_manager
from .core import nexus_tactical_processor


# --- Estética Glass (alinhada ao nexus_manager) -----------------------------


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
    try:
        print(text, file=sys.stdout)
    except UnicodeEncodeError:
        enc = getattr(sys.stdout, "encoding", None) or "utf-8"
        print(text.encode(enc, errors="replace").decode(enc), file=sys.stdout)


def _render_glass_header(title: str, subtitle: str) -> None:
    w = 58
    frost = _rgb(210, 230, 255)
    title_s = _style(bold=True) + frost
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
    lines = [
        "",
        top,
        _glass_line(w - 2, f"{title_s}{title}{_RESET}", edge=edge),
        _glass_line(w - 2, f"{dim}{subtitle}{_RESET}", edge=edge),
        bot,
    ]
    _safe_print("\n".join(lines))


def _render_menu_panel() -> None:
    w = 58
    accent = _rgb(165, 195, 230)
    body = _rgb(200, 220, 245)
    dim = _style(dim=True) + _rgb(150, 170, 200)
    use_uni = _stdout_tty() and _stdout_utf8()
    if use_uni:
        top = "\u256d" + "\u2500" * w + "\u256e"
        bot = "\u2570" + "\u2500" * w + "\u256f"
        e = "\u2502"
    else:
        top = "+" + "-" * w + "+"
        bot = "+" + "-" * w + "+"
        e = "|"
    opts = [
        "[1]  Sequencia de arranque (startup_sequence + LUMEN NEXOS)",
        "[2]  DG01 - Analise preditiva (corpus demo / modo SILENT no Vault)",
        "[3]  Ler alvo planetario (GLOBAL_TARGET_01)",
        "[4]  Carregar perfil seguranca (Atlas) - status",
        "[0]  Sair",
    ]
    lines = ["", top]
    for line in opts:
        pad = max(0, w - 4 - len(line))
        lines.append(f"{accent}{e}{_RESET} {body}{line}{' ' * pad}{_RESET} {accent}{e}{_RESET}")
    lines.append(f"{dim}{e}  Use UTF-8 no terminal para cores completas.{_RESET}{' ' * (w - 44)}{accent}{e}{_RESET}")
    lines.append(bot + "\n")
    _safe_print("\n".join(lines))


def _prompt_choice() -> str:
    p = _rgb(120, 185, 255) + _style(bold=True)
    _safe_print(f"{p}nexus>{_RESET} ")
    return (input().strip() or "0").lower()


def _demo_formulas() -> list[dict[str, str]]:
    return [
        {"id": "cv-demo-001", "hash": "sha256:alpha", "version": "1"},
        {"id": "cv-demo-002", "hash": "sha256:beta", "version": "1"},
        {"id": "cv-demo-003", "hash": "sha256:gamma", "version": "2"},
    ]


def _run_startup() -> None:
    _render_glass_header("PLATAFORMA NEXUS", "sequencia de arranque | core + agentes")
    manager = nexus_manager.NexusManager()
    nexus_manager.startup_sequence(manager)


def _run_predictive_demo() -> None:
    _render_glass_header("DESAFIO GLOBAL 01", "analise preditiva | trilha SILENT no Vault")
    formulas = _demo_formulas()
    report = nexus_tactical_processor.predictive_analysis_from_formulas(formulas)
    dim = _style(dim=True) + _rgb(160, 180, 205)
    hi = _rgb(200, 220, 245)
    _safe_print(f"  {hi}formulas:{_RESET} {report.formula_count}  {hi}cenarios:{_RESET} {len(report.scenarios)}")
    _safe_print(f"  {hi}digest corpus:{_RESET} {report.corpus_fingerprint[:20]}...")
    if report.scenarios:
        s = report.scenarios[-1]
        _safe_print(f"  {hi}ultimo cenario:{_RESET} idx={s.index} score={s.aggregate_score}")
    vault_path = os.environ.get(nexus_tactical_processor.ENV_CHALLENGE01_VAULT, "")
    if vault_path:
        _safe_print(f"  {dim}Vault arquivo:{_RESET} {vault_path}")
    else:
        _safe_print(f"  {dim}Vault arquivo:{_RESET} (nao definido; transcript so em memoria)")
    _safe_print(f"  {dim}Linhas de trilha (preview):{_RESET}")
    for line in report.vault_transcript[-6:]:
        _safe_print(f"    {dim}{line}{_RESET}")


def _show_global_target() -> None:
    _render_glass_header("GLOBAL_TARGET_01", "parametros planetarios (JSON)")
    raw = os.environ.get(nexus_tactical_processor.ENV_GLOBAL_TARGET_01, "")
    if not raw.strip():
        _safe_print("  (vazio) Defina a variavel de ambiente GLOBAL_TARGET_01 com JSON.")
        return
    _safe_print(f"  raw: {raw[:200]}{'...' if len(raw) > 200 else ''}")
    parsed = nexus_tactical_processor.load_global_target_01()
    _safe_print(f"  parsed: {parsed}")


def _show_security_profile() -> None:
    _render_glass_header("PERFIL SEGURANCA", "Atlas Prime | AgentProfile.SECURITY")
    m = nexus_manager.NexusManager()
    agent = m.load_profile(nexus_manager.AgentProfile.SECURITY)
    name = type(agent).__name__
    _safe_print(f"  Agente ativo: {name}")
    _safe_print("  Pronto para ChemVault bridge / Lumen handshake (ver atlas_prime).")


def main() -> None:
    while True:
        _render_glass_header("CONSOLE TATICA NEXUS", "core: nexus_manager + nexus_tactical_processor")
        _render_menu_panel()
        choice = _prompt_choice()
        if choice in ("0", "q", "sair", "exit"):
            _render_glass_header("ATE LOGO", "LUMEN NEXOS | operacao encerrada")
            break
        if choice == "1":
            _run_startup()
        elif choice == "2":
            _run_predictive_demo()
        elif choice == "3":
            _show_global_target()
        elif choice == "4":
            _show_security_profile()
        else:
            _safe_print("  Opcao invalida.\n")


if __name__ == "__main__":
    main()
