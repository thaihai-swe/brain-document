import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { blogSchema } from 'starlight-blog/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: (context) =>
      docsSchema({
        extend: (ctx) => blogSchema(ctx),
      })(context).transform((data) => {
        if (data.sidebar?.order === undefined) {
          const dayMatch = data.title.match(/Day\s*(\d+)/i);
          if (dayMatch) {
            return {
              ...data,
              sidebar: {
                ...data.sidebar,
                order: parseInt(dayMatch[1], 10),
              },
            };
          }
          const weekMatch = data.title.match(/Week\s*(\d+)/i);
          if (weekMatch) {
            return {
              ...data,
              sidebar: {
                ...data.sidebar,
                order: parseInt(weekMatch[1], 10) * 100,
              },
            };
          }
        }
        return data;
      }),
  }),
};
