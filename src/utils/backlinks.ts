import { getCollection } from 'astro:content';

export async function getBacklinksMap() {
  const allPages = await getCollection('docs');
  const backlinksMap = new Map<string, Array<{ id: string; title: string }>>();

  allPages.forEach(page => {
    const content = page.body || '';
    const regex = /\[\[(.*?)\]\]/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      let linkTarget = match[1].split('|')[0]
        .replace(/\.md$/, '')
        .toLowerCase()
        .replace(/\s+/g, '-');
        
      // Find matching page by normalized ID, file slug or subpath
      const targetPage = allPages.find(p => {
        const idLower = p.id.toLowerCase();
        const cleanId = idLower.replace(/\.(md|mdx)$/, '').replace(/\s+/g, '-');
        const filename = cleanId.split('/').pop();
        return filename === linkTarget || cleanId === linkTarget || cleanId.endsWith('/' + linkTarget);
      });
      
      if (targetPage) {
        const targetId = targetPage.id;
        if (!backlinksMap.has(targetId)) {
          backlinksMap.set(targetId, []);
        }
        const links = backlinksMap.get(targetId)!;
        if (!links.some(l => l.id === page.id)) {
          links.push({
            id: page.id,
            title: page.data.title || page.id
          });
        }
      }
    }
  });
  
  return backlinksMap;
}
