"""
Omega Sentinel — shell Flet para operação paralela ao ChemVault (leno.software).

Execução (na pasta omega-sentinel):  flet run main.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import flet as ft


def main(page: ft.Page) -> None:
    page.title = "Omega Sentinel · ChemVault"
    page.theme_mode = ft.ThemeMode.DARK
    page.padding = 24
    page.bgcolor = "#020308"

    page.add(
        ft.Column(
            [
                ft.Text("Omega Sentinel", size=28, weight=ft.FontWeight.W_600, color="#e2e8f0"),
                ft.Text(
                    "Módulos: fórmulas industriais, dossiê técnico, ponte Eco-Bocal / hardware.",
                    size=14,
                    color="#94a3b8",
                ),
                ft.Divider(color="#1e293b"),
                ft.Text("Use os pacotes em db/, models/, modules/ para evoluir a base local.", size=13, color="#64748b"),
            ],
            spacing=12,
        )
    )


if __name__ == "__main__":
    ft.app(main)
