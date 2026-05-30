# My Digital Brain

Personal knowledge base and documentation site built with MkDocs Material.

## Quick Start

### Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Serve locally:
```bash
mkdocs serve
```

Visit http://127.0.0.1:8000

### Adding Content

Simply create new folders and markdown files in the `docs/` directory:

```bash
# Create a new topic
mkdir -p docs/programming
echo "# Python Guide" > docs/programming/python.md

# Navigation updates automatically!
```

### Deployment

Push to GitHub and the site will automatically deploy to GitHub Pages via GitHub Actions.

## Features

- ✅ Automatic navigation generation
- ✅ Full-text search
- ✅ Dark/light mode
- ✅ Mobile responsive
- ✅ Code syntax highlighting
- ✅ Auto-deploy to GitHub Pages

## Customization

Edit `mkdocs.yml` to customize:
- Site name and description
- Theme colors
- Features and plugins
