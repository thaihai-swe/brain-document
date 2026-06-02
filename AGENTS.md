# AI Agent Instructions for "My Digital Brain"

This file (`AGENTS.md`) serves as the core instruction manual for any AI assistant (Gemini, Claude, Cursor, etc.) interacting with this codebase.

## 🎯 Project Overview
- **Name:** My Digital Brain
- **Purpose:** A personal knowledge base and documentation site.
- **Framework:** [MkDocs](https://www.mkdocs.org/) with the [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) theme.
- **Core Principle:** Simple markdown authoring with advanced interconnected features (like Obsidian).

## 🛠 Tech Stack & Structure
- **Content:** Written in standard Markdown (`.md`) inside the `docs/` and `blog/` directories.
- **Styling:** Vanilla CSS overrides located in `overrides/assets/stylesheets/design-tokens.css`. We do NOT use Tailwind or other CSS frameworks.
- **JavaScript:** Custom scripts (graph view, backlinks) are in `overrides/assets/javascripts/`.
- **Config:** `mkdocs.yml` holds all plugin configurations and navigation settings.

## 🎨 Design & Aesthetics
Always refer to the custom design system when making UI/CSS changes:
- **Light Mode:** Warm Editorial (`#FAFAF8` background).
- **Dark Mode:** Near-Black Craft Tool (`#08090A` background).
- **Accent Color:** Indigo Voltage (`#635BFF`).
- **Typography:** System fonts only (no heavy web fonts like Google Fonts).
- **Layout (Desktop):** 15% Left Navigation | 75% Main Content | 10% Right TOC.
- **Aesthetics First:** UIs should be visually stunning, responsive, and follow modern micro-interaction principles without sacrificing performance.

## 🧠 Key Features to Maintain
1. **Wiki Links:** We use Obsidian-style `[[page-name]]` or `[[page-name|Display Text]]` links (via `mkdocs-roamlinks-plugin`). Do not replace these with standard markdown links unless requested.
2. **Graph View:** An interactive D3.js knowledge graph (`overrides/partials/graph-view.html`). Do not break the HTML structure it relies on.
3. **Backlinks:** Bidirectional links automatically rendered at the bottom of pages.
4. **Blog:** Posts are located in `blog/posts/YYYY/MM/`. They require specific YAML frontmatter (date, authors, categories).
5. **Mermaid Diagrams:** Heavily used for architecture and flow charts. Use ````mermaid` syntax.

## ⚙️ Workflows & Commands
- **Local Dev:** Run `mkdocs serve` to preview changes at `http://127.0.0.1:8000`.
- **Build:** Run `mkdocs build` to generate the static site in the `site/` directory and ensure there are no build errors.
- **Adding Regular Docs:** Create `docs/category/topic.md`. Navigation auto-updates.
- **Adding Blog Posts:** Create `blog/posts/YYYY/MM/post-name.md` with proper YAML frontmatter (date, authors, categories) and an `<!-- more -->` separator.

## ⚠️ Strict Rules for AI Agents
1. **Respect Existing CSS:** Make changes in `design-tokens.css` or `extra.css` instead of writing inline styles. Always check existing media queries and layout proportions before modifying sidebars or grids.
2. **No Unnecessary Polling/Loops:** When running `mkdocs build` or background tasks, wait for completion rather than polling.
3. **Markdown Best Practices:** Maintain clean markdown formatting. Keep `yaml` frontmatter intact when modifying existing pages.
4. **Test UI Changes:** If you modify navigation, hamburger menus, or sidebars, double-check that mobile and desktop behaviors remain intact (Material for MkDocs relies heavily on fixed specific widths and transforms for the mobile drawer).
