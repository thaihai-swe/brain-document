# Digital Brain

Personal knowledge base and documentation site built with **Astro** and the **Starlight** documentation theme, featuring the **Starlight Blog** plugin.

## Quick Start

### Local Development

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

3. **Visit the site**:
   Go to [http://localhost:4321/brain-document/](http://localhost:4321/brain-document/) in your browser.

---

### Adding Content

Simply create new folders and markdown files in the `src/content/docs/` directory:

1. **Documentation Pages**:
   Create a markdown file under `src/content/docs/`:
   ```bash
   # Example:
   touch src/content/docs/programming/python.md
   ```
   *Make sure you include a title in the YAML frontmatter:*
   ```markdown
   ---
   title: "Python Guide"
   ---
   # Content starts here...
   ```
   The left sidebar navigation will update automatically!

2. **Blog Posts**:
   Create a markdown file inside `src/content/docs/blog/`:
   ```bash
   # Example:
   touch src/content/docs/blog/my-update.md
   ```
   *Make sure you include a title, date, and author keys in the YAML frontmatter:*
   ```markdown
   ---
   title: "My Blog Update"
   date: 2026-06-17
   authors: ["thaihai"]
   ---
   Your introduction here...
   ```

3. **Library (HTML/PDF Documents)**:
   Place any standalone `.html`, `.htm`, or `.pdf` file anywhere inside the `public/` folder (e.g. `public/books/`). They will be scanned and updated in the Library page automatically during local dev or production builds.

---

### Deployment

Push your changes to the `main` branch on GitHub, and the site will automatically build and deploy to GitHub Pages via GitHub Actions.

## Customization

Edit files to customize:
* **Site and Sidebar configuration**: `astro.config.mjs`
* **Content Collections and Schema**: `src/content.config.ts`
* **Backlinks logic**: `src/utils/backlinks.ts` and components `src/components/Backlinks.astro` / `src/components/CustomFooter.astro`
