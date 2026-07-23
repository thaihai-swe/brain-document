import { visit } from 'unist-util-visit';

export function remarkWikiLinks() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!node.value) return;
      
      const regex = /\[\[(.*?)\]\]/g;
      let match;
      const children = [];
      let lastIndex = 0;
      
      while ((match = regex.exec(node.value)) !== null) {
        const textBefore = node.value.slice(lastIndex, match.index);
        if (textBefore) {
          children.push({ type: 'text', value: textBefore });
        }
        
        const content = match[1];
        let href = content;
        let text = content;
        if (content.includes('|')) {
          const parts = content.split('|');
          href = parts[0];
          text = parts[1];
        }
        
        // Normalize href (remove .md, lowercase, space to dash)
        href = '/brain-document/' + href.replace(/\.md$/, '').toLowerCase().replace(/\s+/g, '-') + '/';
        
        children.push({
          type: 'link',
          url: href,
          children: [{ type: 'text', value: text }],
          data: {
            hProperties: {
              class: 'wikilink'
            }
          }
        });
        
        lastIndex = regex.lastIndex;
      }
      
      const textAfter = node.value.slice(lastIndex);
      if (textAfter) {
        children.push({ type: 'text', value: textAfter });
      }
      
      if (children.length > 0) {
        parent.children.splice(index, 1, ...children);
      }
    });
  };
}
