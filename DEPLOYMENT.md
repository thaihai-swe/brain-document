# GitHub Pages Deployment Guide

## Current Status

Your repository is set up at: `https://github.com/thaihai-swe/brain-document`

The site should be available at: `https://thaihai-swe.github.io/brain-document/`

## Steps to Enable GitHub Pages

### 1. Enable GitHub Pages in Repository Settings

1. Go to your repository: https://github.com/thaihai-swe/brain-document
2. Click **Settings** (top right)
3. Scroll down to **Pages** (left sidebar under "Code and automation")
4. Under **Source**, select **GitHub Actions**
5. Save the changes

### 2. Verify GitHub Actions Workflow

1. Go to the **Actions** tab in your repository
2. You should see a workflow called "Deploy Eleventy to GitHub Pages"
3. If there are no workflow runs, trigger one by:
   - Making a small change and pushing
   - Or click "Run workflow" manually

### 3. Wait for Deployment

- The first deployment takes 2-5 minutes
- Check the Actions tab for progress
- Green checkmark = successful deployment
- Red X = failed (check logs for errors)

### 4. Access Your Site

Once deployed, visit: `https://thaihai-swe.github.io/brain-document/`

## Troubleshooting

### 404 Error

If you see a 404 error:

1. **Check if GitHub Pages is enabled**
   - Go to Settings → Pages
   - Source should be "GitHub Actions"

2. **Check if workflow ran successfully**
   - Go to Actions tab
   - Look for green checkmarks
   - If red X, click to see error logs

3. **Check repository visibility**
   - Go to Settings → General
   - Repository must be **Public** for free GitHub Pages
   - Or you need GitHub Pro for private repos

4. **Wait a few minutes**
   - First deployment can take 5-10 minutes
   - GitHub Pages needs time to propagate

### Workflow Not Running

If the workflow doesn't run automatically:

```bash
# Make a small change and push
echo "# Update" >> README.md
git add README.md
git commit -m "Trigger GitHub Pages deployment"
git push origin main
```

### Permission Issues

If you see permission errors in Actions:

1. Go to Settings → Actions → General
2. Scroll to "Workflow permissions"
3. Select "Read and write permissions"
4. Check "Allow GitHub Actions to create and approve pull requests"
5. Save

## Manual Deployment (Alternative)

If GitHub Actions doesn't work, you can deploy manually:

```bash
# Build the site locally
npm run build

# Deploy to gh-pages branch (requires gh-pages package)
npx gh-pages -d public
```

This pushes the `public` directory to a `gh-pages` branch.

Then in Settings → Pages, set:
- Source: Deploy from a branch
- Branch: gh-pages / (root)

## Verify Deployment

Once deployed, you should see:

- ✅ Your homepage at the root URL
- ✅ All folders in the sidebar navigation
- ✅ Search functionality working
- ✅ Dark/light mode toggle
- ✅ All markdown files accessible

## Next Steps After Deployment

1. **Test the live site**
   - Check all pages load
   - Test search functionality
   - Verify navigation works
   - Test on mobile

2. **Update site_url** (optional)
   If you have a base path, configure it in `.eleventy.js` as the `pathPrefix`.

3. **Add custom domain** (optional)
   - Go to Settings → Pages
   - Add your custom domain
   - Update DNS records

## Automatic Updates

Every time you push to the `main` branch:

1. GitHub Actions automatically runs
2. Builds your MkDocs site
3. Deploys to GitHub Pages
4. Site updates in 2-3 minutes

## Quick Reference

| Action | Command |
|--------|---------|
| Add new content | Create `.md` file in `docs/` |
| Test locally | `npm start` |
| Commit changes | `git add . && git commit -m "message"` |
| Deploy | `git push origin main` |
| Manual deploy | `npm run build && npx gh-pages -d public` |

---

**Current Date**: 2026-05-30

**Repository**: https://github.com/thaihai-swe/brain-document

**Expected URL**: https://thaihai-swe.github.io/brain-document/
