import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.resolve('src/content/docs');
const OUTPUT_FILE = path.resolve('src/utils/sidebar.mjs');
const OVERRIDES = {
  devops: 'DevOps',
  api: 'API',
  graphql: 'GraphQL',
  rest: 'REST',
  'ci-cd': 'CI/CD',
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

// Ensure the src/utils directory exists
const utilsDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(utilsDir)) {
  fs.mkdirSync(utilsDir, { recursive: true });
}

// 1. Read directories under src/content/docs
const items = fs.readdirSync(DOCS_DIR, { withFileTypes: true });
const directories = items
  .filter(item => item.isDirectory() && item.name !== 'blog' && !item.name.startsWith('.') && !item.name.startsWith('_'))
  .map(item => item.name)
  .sort();

// 2. Build the sidebar array
const sidebarEntries = directories.map(dir => ({
  label: formatLabel(dir),
  collapsed: true,
  autogenerate: { directory: dir }
}));

// Append custom links
sidebarEntries.push({
  label: 'Library',
  link: '/library/'
});

// 3. Write to src/utils/sidebar.mjs
const content = `// Generated automatically by scripts/generate-sidebar.js. Do not edit directly.
export const sidebar = ${JSON.stringify(sidebarEntries, null, 2)};
`;

fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
console.log(`Generated sidebar configuration with ${directories.length} directories.`);
