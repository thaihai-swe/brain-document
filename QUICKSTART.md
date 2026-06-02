# Quick Start Guide

## 🚀 Your Digital Brain is Ready!

**Repository**: https://github.com/thaihai-swe/brain-document

**Live Site**: https://thaihai-swe.github.io/brain-document/

## ✅ What's Done

- ✅ Eleventy installed and configured
- ✅ Automatic navigation (no manual config needed)
- ✅ 28 documents across 12 folders
- ✅ Nested folder support (3+ levels deep)
- ✅ GitHub Actions workflow configured
- ✅ All code pushed to GitHub

## 🔧 Enable GitHub Pages (Do This Now!)

**This is the ONLY step you need to do manually:**

1. Go to: https://github.com/thaihai-swe/brain-document/settings/pages
2. Under **"Build and deployment"** → **"Source"**
3. Select: **GitHub Actions**
4. Save

That's it! Wait 2-3 minutes, then visit: https://thaihai-swe.github.io/brain-document/

## 📝 How to Add Content

Your Digital Brain automatically organizes different types of content based on where you place the files.

### 1. Regular Posts (Knowledge Base)
For evergreen notes, guides, and documentation.

1. Create a markdown file anywhere under the `docs/` folder.
   ```bash
   # Example:
   touch docs/my-category/my-topic.md
   ```
2. Add a title (`# My Topic`) or YAML frontmatter (`title: My Topic`).
3. The navigation sidebar will automatically update to include your new folder and file!

### 2. Blog Posts
For time-bound updates, release notes, or journals.

1. Create a markdown file inside `docs/blog/posts/YYYY/MM/`.
   ```bash
   # Example:
   touch docs/blog/posts/2026/06/my-update.md
   ```
2. You **must** include YAML frontmatter with at least the `title` and `date`:
   ```markdown
   ---
   title: "My Update"
   date: 2026-06-02
   ---
   Your introduction here...
   
   <!-- more -->
   
   The rest of your post...
   ```
3. Use the `<!-- more -->` separator to split the summary from the full post. The post will automatically appear on the `/docs/blog/` index page.

### 3. Library (HTML/PDF Documents)
For standalone HTML slide decks, PDF books, or external documents.

1. Drop any `.html`, `.htm`, or `.pdf` file anywhere inside the `docs/` folder (or its subfolders).
2. Run the library builder script to scan for new files and update the `docs/library.md` index:
   ```bash
   python3 build_library.py
   ```
3. The file will now be searchable and accessible from the **Library** section in the sidebar.

### Publishing Your Changes
Once you've added your content:
```bash
git add .
git commit -m "Add new content"
git push origin main
```
**No other configuration is needed!** Wait 2-3 minutes for the GitHub Action to deploy your changes.

## 🎨 Features

- **Search**: Press `/` or click search bar
- **Dark Mode**: Toggle in top right
- **Breadcrumbs**: Shows your location
- **TOC**: Right sidebar shows page structure
- **Navigation**: Left sidebar shows all folders
- **Mobile Responsive**: Works on all devices

## 🔍 Keyboard Shortcuts

- `/` or `S` - Focus search
- `P` - Previous page
- `N` - Next page
- `Esc` - Close search

## 📚 Documentation

- **DEPLOYMENT.md** - Full deployment guide
- **README.md** - Project overview
- **DESIGN.md** - Design system tokens

## 🐛 Troubleshooting

**If you see 404:**

1. Check GitHub Pages is enabled (see above)
2. Go to: https://github.com/thaihai-swe/brain-document/actions
3. Look for green checkmark (success) or red X (error)
4. Wait 5-10 minutes for first deployment

**If workflow doesn't run:**

```bash
# Trigger it manually
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

## 🎯 Next Steps

1. **Enable GitHub Pages** (see above)
2. **Wait for deployment** (check Actions tab)
3. **Visit your site** (https://thaihai-swe.github.io/brain-document/)
4. **Start adding your knowledge!**

## 💡 Tips

- Keep folder names lowercase with hyphens
- Use descriptive file names
- Link between pages with relative paths
- Use markdown features (code blocks, tables, admonitions)
- Commit regularly

## 🆘 Need Help?

Check these files:
- `DEPLOYMENT.md` - Detailed deployment steps
- `README.md` - Usage instructions
- GitHub Actions tab - Deployment status

---

**Created**: 2026-05-30

**Status**: Ready to deploy! Just enable GitHub Pages.
