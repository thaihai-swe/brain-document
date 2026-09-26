import { generateSidebar } from '../src/utils/sidebar.mjs';

const sidebar = generateSidebar();
console.log(`Sidebar is automatically generated at runtime (${sidebar.length} items configured).`);
