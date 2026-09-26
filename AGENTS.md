# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Digital Brain" is a personal knowledge base / documentation site built with **Astro 5** + **Starlight** (`@astrojs/starlight`) and the **starlight-blog** plugin. It deploys as a static site to GitHub Pages at `https://thaihai-swe.github.io/brain-document/`.

Note: the project was migrated from Eleventy to Astro. Some artifacts still reference the old stack — the staged-for-deletion `AGENTS.md` describes the Eleventy setup (ignore it), and the GitHub Actions workflow is named "Deploy Eleventy" but actually builds Astro. Trust the current Astro config over those stale references.

## Commands

```bash
npm install --legacy-peer-deps   # install (--legacy-peer-deps avoids upstream peer conflicts)
npm start                        # or `npm run dev` — local dev server
npm run build                    # production build to dist/ (also builds Pagefind search index)
npm run preview                  # serve the built dist/ locally
```

There is no test suite, linter, or typecheck script configured. `npm run build` is the verification step — it surfaces TypeScript and content-schema errors.

## Base path (important)

The site is served from a subfolder, so `base: '/brain-document'` is set in `astro.config.mjs`. Locally you must visit `http://localhost:4321/brain-document/` (not the bare root). Any hand-written internal URL or asset path must include the `/brain-document/` prefix — this is why the wiki-link plugin and library scanner hardcode it.

## Architecture

Content lives in `src/content/docs/` as Markdown. The `docs` collection (`src/content.config.ts`) uses Starlight's `docsLoader` with `docsSchema` extended by `blogSchema`, so every page accepts both docs and blog frontmatter.

Three content types share that one collection, distinguished by location/frontmatter:
- **Docs** — `src/content/docs/<category>/...md`. Need a `title` in frontmatter. Sidebar sections are dynamically auto-generated at runtime from top-level directories under `src/content/docs` by `src/utils/sidebar.mjs` — simply adding or removing a directory will automatically update the sidebar without manual editing.
- **Blog posts** — `src/content/docs/blog/YYYY/MM/*.md`. Need `title`, `date`, and `authors` (keys must match the `authors` map registered in the `starlightBlog({...})` plugin config). The plugin generates the blog index, pagination, and RSS.
- **Library** — standalone `.html`, `.htm`, `.pdf` files placed anywhere under `public/`. `src/pages/library.astro` scans `public/` **at build time** with Node `fs` and renders a file tree. No manual indexing step; just add the file and rebuild.

### Custom features (two coordinated pieces each)

**Wiki links** (`[[page-name]]` / `[[page-name|Display Text]]`): the remark plugin in `src/plugins/remark-wiki-links.js` (registered under `markdown.remarkPlugins`) rewrites these at parse time into anchor nodes. It normalizes the target to `/brain-document/<lowercased, .md-stripped, spaces→dashes>/`.

**Backlinks**: `src/utils/backlinks.ts` builds a map by scanning every page's raw body for `[[...]]` patterns and resolving them to page IDs (matched by filename, full cleaned id, or subpath suffix). `src/components/Backlinks.astro` reads that map for the current page id and renders a "Backlinks" list. It's injected via `src/components/CustomFooter.astro`, which Starlight uses as the `Footer` component override.

Because both the link rewriter and the backlink resolver parse `[[...]]` independently, their normalization rules (lowercase, strip `.md`, spaces→dashes) must stay in sync or links and backlinks will disagree.

## Deployment

Pushing to `main` triggers `.github/workflows/*.yml`, which runs `npm install --legacy-peer-deps` then `npm run build` and publishes `dist/` to GitHub Pages.

## Conventions

- Don't replace `[[wiki-links]]` with standard Markdown links unless asked.
- Keep YAML frontmatter intact when editing existing pages.
- Custom CSS goes in `src/styles/custom.css` (registered as `customCss`); avoid inline styles.
