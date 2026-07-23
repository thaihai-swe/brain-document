# Digital Brain

Personal knowledge base and documentation site built with **Astro 5** + **Starlight** (`@astrojs/starlight`) and the **starlight-blog** plugin.

- **Repository**: https://github.com/thaihai-swe/brain-document
- **Live Site**: https://thaihai-swe.github.io/brain-document/

---

## 💡 Key Features & Architecture

- **Astro 5 & Starlight**: Modern static site generator optimized for technical documentation.
- **Obsidian Wiki Links**: Custom Remark plugin (`src/plugins/remark-wiki-links.js`) supporting `[[wiki-links]]`.
- **Automated Backlinks**: Calculated at build time (`src/utils/backlinks.ts`) and rendered in a custom footer (`src/components/CustomFooter.astro`).
- **Built-in Search**: Integrated Pagefind indexer with Starlight.
- **Auto-indexed Library**: Standalone `.html`, `.htm`, and `.pdf` files placed under `public/` are automatically scanned and listed on the `/library` page.

---

## 🚀 Quick Start & Local Development

1. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Serve locally**:
   ```bash
   npm start
   # or
   npm run dev
   ```

3. **Visit the site**:
   Go to [http://localhost:4321/brain-document/](http://localhost:4321/brain-document/) in your browser (Astro prefixes URLs with the base path `/brain-document/`).

4. **Production Build & Verification**:
   ```bash
   npm run build
   npm run preview
   ```

---

## 📝 Adding Content

### 1. Documentation Pages (Knowledge Base)
Evergreen technical knowledge, references, and guides.
1. Create a markdown file anywhere under `src/content/docs/`:
   ```bash
   touch src/content/docs/programming/python.md
   ```
2. Include YAML frontmatter with at least the `title`:
   ```markdown
   ---
   title: "Python Guide"
   ---
   Your content here...
   ```
3. Sidebar navigation sections update automatically based on directory structure configured in `astro.config.mjs`.

### 2. Blog Posts
For journals, release logs, and progress updates.
1. Create a markdown file under `src/content/docs/blog/` (e.g. `src/content/docs/blog/2026/06/my-update.md`):
   ```bash
   touch src/content/docs/blog/2026/06/my-update.md
   ```
2. Include YAML frontmatter with `title`, `date`, and `authors`:
   ```markdown
   ---
   title: "June Progress Report"
   date: 2026-06-17
   authors: ["thaihai"]
   ---
   Your post introduction here...
   ```
3. The plugin automatically generates the blog index, pagination, author tags, and RSS feed at `/blog/`.

### 3. Library (HTML/PDF Documents)
For standalone HTML decks (such as book slides) and PDFs.
1. Place any `.html`, `.htm`, or `.pdf` file anywhere inside the `public/` directory (e.g. `public/books/`).
2. `src/pages/library.astro` scans and lists them automatically at build time without requiring manual indexing.

---

## ⚙️ Customization & Architecture

- **Site & Sidebar Configuration**: `astro.config.mjs`
- **Content Collections & Schema**: `src/content.config.ts`
- **Wiki Links Plugin**: `src/plugins/remark-wiki-links.js`
- **Backlinks Logic**: `src/utils/backlinks.ts` and components `src/components/Backlinks.astro` / `src/components/CustomFooter.astro`
- **Custom Styling**: `src/styles/custom.css`

---

## 🚀 Deployment

Push your changes to the `main` branch on GitHub:
```bash
git add .
git commit -m "Update content"
git push origin main
```
GitHub Actions automatically builds and deploys the site to GitHub Pages.

---

## 📚 Related Documentation
- `DEPLOYMENT.md`: Build and release pipeline details.
