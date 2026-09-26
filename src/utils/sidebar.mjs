import fs from 'node:fs';
import path from 'node:path';

const DOCS_DIR = path.resolve('src/content/docs');
const OVERRIDES = {
  devops: 'DevOps',
  api: 'API',
  graphql: 'GraphQL',
  rest: 'REST',
  'ci-cd': 'CI/CD',
  dsa: 'DSA',
};

function formatLabel(name) {
  return name
    .split('-')
    .map(word => {
      const lower = word.toLowerCase();
      if (OVERRIDES[lower]) return OVERRIDES[lower];
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function generateSidebar() {
  if (!fs.existsSync(DOCS_DIR)) return [];

  const items = fs.readdirSync(DOCS_DIR, { withFileTypes: true });
  const directories = items
    .filter(item => item.isDirectory() && item.name !== 'blog' && !item.name.startsWith('.') && !item.name.startsWith('_'))
    .map(item => item.name)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const sidebarEntries = directories.map(dir => ({
    label: formatLabel(dir),
    collapsed: true,
    autogenerate: { directory: dir }
  }));

  sidebarEntries.push({
    label: 'Library',
    link: '/library/'
  });

  return sidebarEntries;
}

// Automatically computed on load so it stays up-to-date without manual editing
export const sidebar = generateSidebar();
