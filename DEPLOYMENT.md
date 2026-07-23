# GitHub Pages Deployment Guide

This guide describes how the Astro + Starlight static site is built and deployed to GitHub Pages.

## Current Status

* **Repository**: `https://github.com/thaihai-swe/brain-document`
* **Live Site URL**: `https://thaihai-swe.github.io/brain-document/`

---

## 🚀 Deployment Workflow (CI/CD)

The project uses a GitHub Actions workflow defined in `.github/workflows/deploy.yml` that automatically triggers on every push to the `main` branch:

1. **Checkout**: Checks out the repository files.
2. **Setup Node**: Prepares the Node.js runner environment (Node 20).
3. **Install Dependencies**: Runs `npm install --legacy-peer-deps` to install all packages.
4. **Build Site**: Runs `npm run build` (which compiles pages and indexes search keywords).
5. **Output Directory**: Astro compiles all static assets, documents, and search index files to the `./dist` directory.
6. **Upload Pages Artifact**: Package and upload the `./dist` folder to GitHub Pages.
7. **Deploy**: Deploys the static site to the live URL.

---

## 🔧 Manual Deployment (Alternative)

If you need to deploy the site manually from your local command line, build the project and push the compiled static output to the `gh-pages` branch:

```bash
# 1. Build the Astro production bundle
npm run build

# 2. Deploy the dist folder to the gh-pages branch (using the gh-pages npm utility)
npx gh-pages -d dist
```

Ensure that in your GitHub Repository Settings under **Settings** → **Pages**, the **Source** is set to match your branch deployment (`gh-pages`).

---

## 🐛 Troubleshooting

### 404 Pages
* **Check Base Path**: Starlight is configured with `base: '/brain-document'` in `astro.config.mjs` to match GitHub Pages hosting subfolders. Locally, you must visit the `/brain-document/` path prefix (e.g. `http://localhost:4321/brain-document/`).
* **Check Deployment Status**: Go to the **Actions** tab in your GitHub repository and check if the latest workflow run succeeded (green checkmark) or failed (red X).

### Node Engine Compatibility
* Astro 5 is used to maintain compatibility with Node 20.x in local/CI environments. If you encounter engine warnings during installation, run `npm install --legacy-peer-deps` to bypass upstream conflicts.

---

## Quick Command Reference

| Purpose | Command |
|---|---|
| Install dependencies | `npm install --legacy-peer-deps` |
| Start local dev server | `npm start` |
| Build production bundle | `npm run build` |
| Test built site locally | `npm run preview` |
