#!/usr/bin/env python3
"""Build docs/library.md — a browseable tree of HTML/PDF docs.

Scans docs/ for .html and .pdf files and writes a single markdown page
that MkDocs renders at /library/ and includes in the sidebar nav.
Markdown files are intentionally excluded because MkDocs already exposes
them in the sidebar.

Run manually:    python3 build_library.py
On push to GitHub: handled by .github/workflows/deploy.yml (before mkdocs build)
"""

from __future__ import annotations

import html
import os
import re
import sys
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
DOCS = ROOT / "docs"
OUTPUT = DOCS / "library.md"

DOC_EXTS = {".html", ".htm", ".pdf"}
MAX_DEPTH = 5

SKIP_NAMES = {
    ".git", ".github", ".DS_Store", "node_modules",
    "stylesheets", "javascripts",
    "library", "library.md",
    "common.css", "common.js",
    "index.md", "index.html",
}

ICON_BY_EXT = {
    ".html": "🌐",
    ".htm": "🌐",
    ".pdf": "📕",
}


def natural_key(s: str):
    return [int(t) if t.isdigit() else t.lower()
            for t in re.split(r"(\d+)", s)]


def is_doc(p: Path) -> bool:
    return p.is_file() and p.suffix.lower() in DOC_EXTS


def should_skip(p: Path) -> bool:
    if p.name in SKIP_NAMES:
        return True
    if p.name.startswith("."):
        return True
    return False


def scan(folder: Path, depth: int):
    if depth > MAX_DEPTH:
        return [], []

    children = sorted(folder.iterdir(), key=lambda p: natural_key(p.name))
    subfolders = []
    docs = []
    for c in children:
        if should_skip(c):
            continue
        if c.is_dir():
            if depth + 1 > MAX_DEPTH:
                continue
            sub_subs, sub_docs = scan(c, depth + 1)
            if sub_subs or sub_docs:
                subfolders.append((c, sub_subs, sub_docs))
        elif is_doc(c):
            docs.append(c)
    return subfolders, docs


def count_docs(subfolders, docs) -> int:
    n = len(docs)
    for _, ss, ds in subfolders:
        n += count_docs(ss, ds)
    return n


def href_for(target: Path) -> str:
    # MkDocs renders library.md at /library/, so relative paths
    # need to escape one level back to docs/ root.
    rel = target.relative_to(DOCS)
    return "../" + quote(str(rel).replace(os.sep, "/"))


def render_tree(subfolders, docs, depth: int) -> str:
    if not subfolders and not docs:
        return ""
    parts = ["<ul>"]
    for f, sub_subs, sub_docs in subfolders:
        open_attr = " open" if depth == 0 else ""
        top_class = ' class="top"' if depth == 0 else ""
        inner = render_tree(sub_subs, sub_docs, depth + 1)
        n = count_docs(sub_subs, sub_docs)
        parts.append(
            f'<li class="folder">'
            f'<details{open_attr}{top_class}>'
            f'<summary>'
            f'<span class="ico">📁</span>'
            f'<span class="name">{html.escape(f.name)}</span>'
            f'<span class="count">{n}</span>'
            f'</summary>'
            f'{inner}'
            f'</details>'
            f'</li>'
        )
    for d in docs:
        ico = ICON_BY_EXT.get(d.suffix.lower(), "📄")
        kind = d.suffix.lower().lstrip(".")
        parts.append(
            f'<li class="doc">'
            f'<a href="{html.escape(href_for(d))}" data-kind="{kind}">'
            f'<span class="ico">{ico}</span>'
            f'<span class="name">{html.escape(d.name)}</span>'
            f'</a>'
            f'</li>'
        )
    parts.append("</ul>")
    return "".join(parts)


PAGE_TMPL = """# Library

Browse standalone HTML decks and PDFs. Click any item to open it in a new view.

<input type="search" id="lib-q" class="lib-search" placeholder="Filter by name…" autocomplete="off" markdown="0">
<div class="lib-tree" id="lib-tree" markdown="0">
{tree}
</div>
<p class="lib-footer" markdown="0"><small>{count} documents</small></p>

<style>
.lib-search {{
  width: 100%;
  padding: .65rem .9rem;
  font: inherit;
  background: var(--md-default-bg-color);
  color: var(--md-default-fg-color);
  border: 1px solid var(--md-default-fg-color--lightest);
  border-radius: 8px;
  margin: 1rem 0 1.25rem;
  outline: none;
}}
.lib-search:focus {{
  border-color: var(--md-accent-fg-color);
  box-shadow: 0 0 0 3px var(--md-accent-fg-color--transparent);
}}
.lib-tree ul {{ list-style: none; padding-left: 1.1rem; margin: 0; }}
.lib-tree > ul {{ padding-left: 0; }}
.lib-tree li {{ margin: 2px 0; }}
.lib-tree details > summary {{
  cursor: pointer;
  user-select: none;
  padding: 5px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: .5rem;
  list-style: none;
}}
.lib-tree details > summary::-webkit-details-marker {{ display: none; }}
.lib-tree details > summary::before {{
  content: '▸';
  color: var(--md-default-fg-color--light);
  font-size: .75rem;
  display: inline-block;
  transition: transform .15s;
}}
.lib-tree details[open] > summary::before {{ transform: rotate(90deg); }}
.lib-tree details > summary:hover {{ background: var(--md-default-fg-color--lightest); }}
.lib-tree .count {{
  margin-left: auto;
  color: var(--md-default-fg-color--light);
  font-size: .8rem;
  font-variant-numeric: tabular-nums;
}}
.lib-tree .doc a {{
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: 5px 8px 5px 22px;
  text-decoration: none;
  color: var(--md-default-fg-color);
  border-radius: 6px;
}}
.lib-tree .doc a:hover {{
  background: var(--md-accent-fg-color--transparent);
  color: var(--md-accent-fg-color);
}}
.lib-tree .ico {{ font-size: .95rem; }}
.lib-tree .name {{ font-size: .9rem; }}
.lib-tree .hidden {{ display: none !important; }}
.lib-footer {{ color: var(--md-default-fg-color--light); margin-top: 2rem; }}
</style>

<script>
(function () {{
  const q = document.getElementById('lib-q');
  const tree = document.getElementById('lib-tree');
  if (!q || !tree) return;

  function nameOf(li) {{
    const el = li.querySelector(':scope > a > .name, :scope > details > summary > .name');
    return (el && el.textContent || '').toLowerCase();
  }}

  function applyFilter(term) {{
    term = term.trim().toLowerCase();
    tree.querySelectorAll('li').forEach(li => li.classList.remove('hidden'));
    if (!term) {{
      tree.querySelectorAll('details').forEach(d => {{
        d.open = d.classList.contains('top');
      }});
      return;
    }}
    tree.querySelectorAll('li.doc').forEach(li => {{
      if (!nameOf(li).includes(term)) li.classList.add('hidden');
    }});
    Array.from(tree.querySelectorAll('li.folder')).reverse().forEach(li => {{
      const anyVisible = li.querySelector('li:not(.hidden)');
      if (!anyVisible && !nameOf(li).includes(term)) {{
        li.classList.add('hidden');
      }} else {{
        const det = li.querySelector(':scope > details');
        if (det) det.open = true;
      }}
    }});
  }}

  q.addEventListener('input', e => applyFilter(e.target.value));
}})();
</script>
"""


def main() -> int:
    if not DOCS.is_dir():
        print(f"docs/ not found at {DOCS}", file=sys.stderr)
        return 1

    subfolders, docs = scan(DOCS, depth=0)
    if not subfolders and not docs:
        body = '<p><em>No documents found.</em></p>'
        total = 0
    else:
        body = render_tree(subfolders, docs, depth=0)
        total = count_docs(subfolders, docs)

    page = PAGE_TMPL.format(tree=body, count=total)
    OUTPUT.write_text(page, encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)} ({total} docs)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
