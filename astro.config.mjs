import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkWikiLinks } from './src/plugins/remark-wiki-links.js';
import { sidebar } from './src/utils/sidebar.mjs';

export default defineConfig({
  base: '/brain-document',
  site: 'https://thaihai-swe.github.io',
  markdown: {
    remarkPlugins: [remarkWikiLinks, remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  integrations: [
    starlight({
      title: 'Digital Brain',
      customCss: [
        './src/styles/custom.css',
        'katex/dist/katex.min.css',
      ],
      editLink: {
        baseUrl: 'https://github.com/thaihai-swe/brain-document/edit/main/',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/thaihai-swe/brain-document' }
      ],
      plugins: [
        starlightBlog({
          authors: {
            "Thai Hai": {
              name: 'Thai Hai',
              title: 'Author',
              url: 'https://github.com/thaihai-swe',
            },
            thaihai: {
              name: 'Thai Hai',
              title: 'Author',
              url: 'https://github.com/thaihai-swe',
            },
            admin: {
              name: 'Administrator',
              title: 'Admin',
              url: 'https://github.com/thaihai-swe',
            }
          }
        })
      ],
      sidebar,
      components: {
        Footer: './src/components/CustomFooter.astro',
      },
    }),
  ],
});
