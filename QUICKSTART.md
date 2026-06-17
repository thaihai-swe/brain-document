# Quick Start Guide

## 🚀 Your Astro Starlight Digital Brain is Ready!

**Repository**: https://github.com/thaihai-swe/brain-document

**Live Site**: https://thaihai-swe.github.io/brain-document/

---

## ✅ Migration Status
- **Framework**: Upgraded from Eleventy to Astro + Starlight.
- **Node Engine Compatibility**: Locked dependencies to Astro 5 and Starlight 0.37.0 to guarantee smooth building under local Node `v20.20.2`.
- **Wiki Links**: Enabled custom Remark plugin for Obsidian `[[wiki-links]]`.
- **Backlinks**: Automated calculation at build-time, rendering at the bottom of pages via a custom footer component.
- **Search**: Built-in Pagefind indexer integrated directly with Starlight.

---

## 🔧 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Serve locally**:
   ```bash
   npm start
   # or
   npm run dev
   ```

3. **Access site**:
   Visit [http://localhost:4321/brain-document/](http://localhost:4321/brain-document/) (Astro prefixes URLs with the base path `/brain-document/` to match the GitHub Pages URL structure).

---

## 📝 How to Add Content

### 1. Documentation Pages (Knowledge Base)
Evergreen technical knowledge, references, and guides.
1. Create a markdown file anywhere under `src/content/docs/`.
   ```bash
   # Example:
   touch src/content/docs/programming/python.md
   ```
2. You **must** include YAML frontmatter with at least the `title`:
   ```markdown
   ---
   title: "Python Guide"
   ---
   Your content here...
   ```
3. The left sidebar navigation updates automatically based on directory structures configured in `astro.config.mjs`!

### 2. Blog Posts
For journals, release logs, and progress updates.
1. Create a markdown file inside `src/content/docs/blog/`.
   ```bash
   # Example:
   touch src/content/docs/blog/2026/06/my-update.md
   ```
2. Include YAML frontmatter with the `title`, `date`, and `authors`:
   ```markdown
   ---
   title: "June Progress Report"
   date: 2026-06-17
   authors: ["thaihai"]
   ---
   Your post introduction here...
   ```
3. Write posts normally. The plugin automatically generates the blog list view, pagination, author tags, and RSS feed at `/blog/`.

### 3. Library (HTML/PDF Documents)
For standalone HTML decks (such as book slides) and PDFs.
1. Put any `.html`, `.htm`, or `.pdf` file anywhere inside the `public/` directory (e.g. `public/books/`).
2. The custom page `src/pages/library.astro` will scan and list them automatically. There is no need to run any builder scripts manually!

---

## 🚀 Publishing Your Changes
Per the instructions, **do not automate Git operations**. Run the standard workflow manually:
```bash
git add .
git commit -m "Update content"
git push origin main
```
The GitHub Action will automatically run, build, and deploy the updated static files to GitHub Pages.

## 📚 Documentation Reference
- **DEPLOYMENT.md**: Details on the build and release pipeline.
- **README.md**: Standard quick reference.
- **AGENTS.md**: Manual guide rules for AI assistants editing this repository.
