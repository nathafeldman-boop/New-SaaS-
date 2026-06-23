#!/usr/bin/env python3
"""Génère index.html (autonome) à partir de index.html.tmpl.

Remplace chaque token `__IMG:nom.jpg__` par l'image correspondante de
public/results/ encodée en base64 (data URI). Ainsi le fichier final
fonctionne en fichier unique, sans dossier d'images à côté.

Usage :  python3 scripts/build-index.py
"""
import base64
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESULTS = os.path.join(ROOT, "public", "results")


def data_uri(name: str) -> str:
    with open(os.path.join(RESULTS, name), "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    return "data:image/jpeg;base64," + b64


def main() -> None:
    tmpl = open(os.path.join(ROOT, "index.html.tmpl"), encoding="utf-8").read()
    out = re.sub(r"__IMG:([^_]+)__", lambda m: data_uri(m.group(1)), tmpl)
    dst = os.path.join(ROOT, "index.html")
    open(dst, "w", encoding="utf-8").write(out)
    print(f"index.html généré ({len(out) // 1024} Ko)")


if __name__ == "__main__":
    main()
