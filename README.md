# Digital Brain

Personal knowledge base and documentation site built with Eleventy.

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Serve locally:
```bash
npm start
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

Edit `.eleventy.js` and CSS files to customize:
- Site configuration and collections
- Theme colors in `overrides/assets/stylesheets/design-tokens.css`
- Features and plugins


## Layout
  ┌──────────────────────────────────────────────────────┐
  │  15%   │           75%              │      10%       │
  │  Left  │      Main Content          │     Right      │
  │ Sidebar│   (Your HTML page)         │    Sidebar     │
  │  (Nav) │  7.5% padding on each side │     (TOC)      │
  └──────────────────────────────────────────────────────┘
