Dont commit and push code

# AI Agent Instructions for "Digital Brain"

This file (`AGENTS.md`) serves as the core instruction manual for any AI assistant (Gemini, Claude, Cursor, etc.) interacting with this codebase.

## 🎯 Project Overview
- **Name:** Digital Brain
- **Purpose:** A personal knowledge base and documentation site.
- **Framework:** [Eleventy](https://www.11ty.dev/).
- **Core Principle:** Simple markdown authoring with advanced interconnected features (like Obsidian).

## 🛠 Tech Stack & Structure
- **Content:** Written in standard Markdown (`.md`) inside the `docs/` and `blog/` directories.
- **Styling:** Vanilla CSS overrides located in `overrides/assets/stylesheets/design-tokens.css` and `overrides/assets/stylesheets/extra.css`. We do NOT use Tailwind or other CSS frameworks.
- **JavaScript:** Custom scripts (backlinks) are in `overrides/assets/javascripts/`.
- **Config:** `.eleventy.js` holds all plugin configurations and collections.

## 🎨 Design & Aesthetics
Always refer to the custom design system when making UI/CSS changes:
- **Light Mode:** Warm Editorial (`#FAFAF8` background).
- **Dark Mode:** Near-Black Craft Tool (`#08090A` background).
- **Accent Color:** Indigo Voltage (`#635BFF`).
- **Typography:** System fonts only (no heavy web fonts like Google Fonts).
- **Layout (Desktop):** 15% Left Navigation | 75% Main Content | 10% Right TOC.
- **Aesthetics First:** UIs should be visually stunning, responsive, and follow modern micro-interaction principles without sacrificing performance.

## 🧠 Key Features to Maintain
1. **Wiki Links:** We use Obsidian-style `[[page-name]]` or `[[page-name|Display Text]]` links. Do not replace these with standard markdown links unless requested.
2. **Backlinks:** Bidirectional links automatically rendered at the bottom of pages.
3. **Blog:** Posts are located in `blog/posts/YYYY/MM/`. They require specific YAML frontmatter (date, authors, categories).
4. **Mermaid Diagrams:** Heavily used for architecture and flow charts. Use ` ```mermaid ` syntax.

## ⚙️ Workflows & Commands
- **Local Dev:** Run `npm start` to preview changes at `http://localhost:8080`.
- **Build:** Run `npm run build` to generate the static site in the `public/` directory and build the Pagefind search index.
- **Adding Regular Docs:** Create `docs/category/topic.md`. Navigation auto-updates.
- **Adding Blog Posts:** Create `blog/posts/YYYY/MM/post-name.md` with proper YAML frontmatter (date, authors, categories) and an `<!-- more -->` separator.

## ⚠️ Strict Rules for AI Agents
1. **Respect Existing CSS:** Make changes in `design-tokens.css` or `extra.css` instead of writing inline styles. Always check existing media queries and layout proportions before modifying sidebars or grids.
2. **No Unnecessary Polling/Loops:** When running `npm run build` or background tasks, wait for completion rather than polling.
3. **Markdown Best Practices:** Maintain clean markdown formatting. Keep `yaml` frontmatter intact when modifying existing pages.
4. **Test UI Changes:** If you modify navigation or sidebars, verify changes across different viewport sizes.
