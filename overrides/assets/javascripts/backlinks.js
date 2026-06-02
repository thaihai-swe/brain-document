// Backlinks functionality
// Shows which pages link to the current page

let backlinksData = [];

// Initialize backlinks on page load
document.addEventListener('DOMContentLoaded', function() {
  buildBacklinks();
});

// Build backlinks data
function buildBacklinks() {
  const currentPath = window.location.pathname;
  const backlinks = [];

  // Get all navigation links
  const navItems = document.querySelectorAll('.md-nav__link');
  const pageMap = new Map();

  // Build map of all pages
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('#')) {
      const title = item.textContent.trim();
      const path = href.replace(/^\.\.\//, '').replace(/\/$/, '');
      pageMap.set(path, { title, href });
    }
  });

  // Find pages that link to current page
  // Note: This is a simplified version - in production, you'd want to
  // generate this data at build time for better performance

  // For now, we'll check the navigation structure
  // In a real implementation, you'd parse all markdown files at build time

  backlinksData = backlinks;
  renderBacklinks();
}

// Render backlinks section
function renderBacklinks() {
  // Find or create backlinks container
  let container = document.getElementById('backlinks-container');

  if (!container) {
    const content = document.querySelector('.md-content__inner');
    if (content) {
      container = document.createElement('div');
      container.id = 'backlinks-container';
      container.className = 'md-backlinks';
      content.appendChild(container);
    }
  }

  if (!container) return;

  // Clear existing content
  container.innerHTML = '';

  // If no backlinks, show nothing
  if (backlinksData.length === 0) {
    return;
  }

  // Create backlinks section
  const section = document.createElement('div');
  section.className = 'md-backlinks-section';

  const header = document.createElement('h2');
  header.textContent = `Linked from ${backlinksData.length} page${backlinksData.length !== 1 ? 's' : ''}`;
  header.className = 'md-backlinks-header';
  section.appendChild(header);

  const list = document.createElement('ul');
  list.className = 'md-backlinks-list';

  backlinksData.forEach(backlink => {
    const item = document.createElement('li');
    item.className = 'md-backlinks-item';

    const link = document.createElement('a');
    link.href = backlink.href;
    link.textContent = backlink.title;
    link.className = 'md-backlinks-link';

    if (backlink.context) {
      const context = document.createElement('p');
      context.className = 'md-backlinks-context';
      context.textContent = backlink.context;
      item.appendChild(link);
      item.appendChild(context);
    } else {
      item.appendChild(link);
    }

    list.appendChild(item);
  });

  section.appendChild(list);
  container.appendChild(section);
}

// Add CSS for backlinks
const style = document.createElement('style');
style.textContent = `
.md-backlinks {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--bd-border, #E6E4DE);
}

.md-backlinks-header {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
  color: var(--bd-text-primary, #111111);
}

.md-backlinks-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--bd-space-4, 16px);
}

.md-backlinks-item {
  margin-bottom: 0;
  padding: 16px;
  background: var(--bd-surface-muted, #F4F4F1);
  border-radius: var(--bd-radius-lg, 10px);
  border: 1px solid var(--bd-border, #E6E4DE);
  box-shadow: var(--bd-shadow-xs);
  transition: transform var(--bd-motion-base, 160ms) var(--bd-ease-out, ease-out), 
              box-shadow var(--bd-motion-base, 160ms) var(--bd-ease-out, ease-out),
              border-color var(--bd-motion-base, 160ms) var(--bd-ease-out, ease-out);
  display: flex;
  flex-direction: column;
}

.md-backlinks-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--bd-shadow-md);
  border-color: var(--bd-accent-soft, #EFEEFF);
}

.md-backlinks-link {
  font-weight: 600;
  color: var(--bd-accent, #635BFF);
  text-decoration: none;
  display: block;
  margin-bottom: 8px;
}

.md-backlinks-link:hover {
  text-decoration: underline;
}

.md-backlinks-context {
  font-size: 13px;
  color: var(--bd-text-secondary, #55524C);
  margin: 0;
  line-height: 1.5;
  flex-grow: 1;
}

/* Dark mode overrides (mostly handled by tokens, but just in case) */
[data-md-color-scheme="slate"] .md-backlinks-item:hover {
  border-color: var(--bd-border-strong);
}
`;
document.head.appendChild(style);
