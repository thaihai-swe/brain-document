import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';
import { remarkWikiLinks } from './src/plugins/remark-wiki-links.js';

export default defineConfig({
  base: '/brain-document',
  site: 'https://thaihai-swe.github.io',
  markdown: {
    remarkPlugins: [remarkWikiLinks],
  },
  integrations: [
    starlight({
      title: 'Digital Brain',
      customCss: ['./src/styles/custom.css'],
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
      sidebar: [
        {
          label: 'Architecture',
          autogenerate: { directory: 'architecture' },
        },
        {
          label: 'Backend',
          autogenerate: { directory: 'backend' },
        },
        {
          label: 'Frontend',
          autogenerate: { directory: 'frontend' },
        },
        {
          label: 'DevOps',
          autogenerate: { directory: 'devops' },
        },
        {
          label: 'Guides',
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'Library',
          link: '/library/',
        },
      ],
      components: {
        Footer: './src/components/CustomFooter.astro',
      },
    }),
  ],
});
