#!/usr/bin/env python3
"""Generate sitemap.xml from canonical, indexable HTML pages."""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime
from pathlib import Path
from xml.sax.saxutils import escape

SITE_URL = "https://sugita-sakuraclinic.com"

PRIORITY = {
    "/": "1.0",
    "/accident/": "0.9",
    "/services/": "0.8",
    "/clinic-guide/": "0.75",
    "/about/": "0.7",
    "/hours/": "0.7",
    "/access/": "0.7",
    "/faq/": "0.6",
    "/column/": "0.6",
}

TREATMENT_PATHS = {
    "/trauma-care/",
    "/acupuncture/",
    "/pelvic-correction/",
    "/sports-injury/",
    "/rehabilitation/",
    "/manual-therapy/",
    "/electrotherapy/",
    "/lumbar-traction/",
    "/aquatizer/",
}

SYMPTOM_PATHS = {
    "/lumbar-pain/",
    "/shoulder-pain/",
    "/knee-pain/",
    "/tendinitis/",
    "/ankle-pain/",
    "/finger-injury/",
    "/neck-pain/",
}


def canonical_to_path(canonical: str) -> str:
    if not canonical.startswith(SITE_URL):
        return "/"
    path = canonical[len(SITE_URL):]
    return path or "/"


def existing_lastmods(root: Path) -> dict[str, str]:
    sitemap = root / "sitemap.xml"
    if not sitemap.exists():
        return {}
    text = sitemap.read_text(encoding="utf-8")
    found: dict[str, str] = {}
    for block in re.findall(r"<url>\s*(.*?)\s*</url>", text, re.S):
        loc = re.search(r"<loc>(.*?)</loc>", block, re.S)
        lastmod = re.search(r"<lastmod>(.*?)</lastmod>", block, re.S)
        if loc and lastmod:
            found[loc.group(1).strip()] = lastmod.group(1).strip()
    return found


def json_ld_date(text: str) -> str | None:
    for match in re.finditer(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', text, re.S):
        try:
            data = json.loads(match.group(1))
        except Exception:
            continue
        nodes = data.get("@graph", [data]) if isinstance(data, dict) else []
        for node in nodes:
            if not isinstance(node, dict):
                continue
            value = node.get("dateModified") or node.get("datePublished")
            if isinstance(value, str) and re.match(r"\d{4}-\d{2}-\d{2}", value):
                return value[:10]
    return None


def file_date(path: Path) -> str:
    return datetime.fromtimestamp(path.stat().st_mtime).date().isoformat()


def changefreq_for(path: str) -> str:
    if path == "/column/":
        return "daily"
    if path.startswith("/column/"):
        return "monthly"
    if path == "/":
        return "weekly"
    return "monthly"


def priority_for(path: str) -> str:
    if path in PRIORITY:
        return PRIORITY[path]
    if path in TREATMENT_PATHS:
        return "0.75"
    if path in SYMPTOM_PATHS:
        return "0.7"
    if path.startswith("/column/"):
        return "0.55"
    return "0.5"


def sort_key(url: str) -> tuple[int, str]:
    path = canonical_to_path(url)
    order = [
        "/",
        "/accident/",
        "/services/",
        "/clinic-guide/",
        "/trauma-care/",
        "/acupuncture/",
        "/pelvic-correction/",
        "/sports-injury/",
        "/rehabilitation/",
        "/manual-therapy/",
        "/electrotherapy/",
        "/lumbar-traction/",
        "/aquatizer/",
        "/about/",
        "/hours/",
        "/access/",
        "/faq/",
        "/lumbar-pain/",
        "/shoulder-pain/",
        "/knee-pain/",
        "/tendinitis/",
        "/ankle-pain/",
        "/finger-injury/",
        "/neck-pain/",
        "/column/",
    ]
    if path in order:
        return (order.index(path), path)
    if path.startswith("/column/"):
        return (100, path)
    return (50, path)


def collect_urls(root: Path) -> list[dict[str, str]]:
    previous = existing_lastmods(root)
    entries: dict[str, dict[str, str]] = {}
    for html_path in root.rglob("*.html"):
        if ".git" in html_path.parts:
            continue
        text = html_path.read_text(encoding="utf-8", errors="ignore")
        robots = re.search(r'<meta name="robots" content="([^"]+)"', text, re.I)
        if robots and "noindex" in robots.group(1).lower():
            continue
        canonical = re.search(r'<link rel="canonical" href="([^"]+)"', text, re.I)
        if not canonical:
            continue
        loc = canonical.group(1).strip()
        if not loc.startswith(SITE_URL):
            continue
        path = canonical_to_path(loc)
        date = json_ld_date(text) or previous.get(loc) or file_date(html_path)
        entries[loc] = {
            "loc": loc,
            "lastmod": date,
            "changefreq": changefreq_for(path),
            "priority": priority_for(path),
        }
    return [entries[url] for url in sorted(entries, key=sort_key)]


def render_sitemap(entries: list[dict[str, str]]) -> str:
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for entry in entries:
        lines.extend([
            "  <url>",
            f"    <loc>{escape(entry['loc'])}</loc>",
            f"    <lastmod>{entry['lastmod']}</lastmod>",
            f"    <changefreq>{entry['changefreq']}</changefreq>",
            f"    <priority>{entry['priority']}</priority>",
            "  </url>",
        ])
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def generate_sitemap(root: Path) -> int:
    entries = collect_urls(root)
    (root / "sitemap.xml").write_text(render_sitemap(entries), encoding="utf-8")
    return len(entries)


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd()
    count = generate_sitemap(root)
    print(f"Generated sitemap.xml with {count} URLs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
