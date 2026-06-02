const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItTocDoneRight = require("markdown-it-toc-done-right");
const markdownItAttrs = require("markdown-it-attrs");
const markdownItTaskLists = require("markdown-it-task-lists");
const fs = require("fs");
const path = require("path");

module.exports = function(eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  // Passthrough copy for assets
  eleventyConfig.addPassthroughCopy("overrides/assets");
  eleventyConfig.addPassthroughCopy("docs/**/*.html");
  eleventyConfig.addPassthroughCopy("docs/**/*.pdf");
  eleventyConfig.addPassthroughCopy("docs/**/*.css");
  eleventyConfig.addPassthroughCopy("docs/**/*.js");
  eleventyConfig.addPassthroughCopy("docs/**/*.png");
  eleventyConfig.addPassthroughCopy("docs/**/*.jpg");
  
  // Custom Markdown Library
  const markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  })
    .use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.headerLink()
    })
    .use(markdownItTocDoneRight)
    .use(markdownItAttrs)
    .use(markdownItTaskLists)
    .use(function(md) {
      // Custom WikiLink Plugin: [[page-name]] or [[page-name|Display Text]]
      const defaultRender = md.renderer.rules.text || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };
      
      md.inline.ruler.before('link', 'wikilink', function(state, silent) {
        const match = /^\[\[(.*?)\]\]/.exec(state.src.slice(state.pos));
        if (!match) return false;
        if (!silent) {
          const content = match[1];
          let href = content;
          let text = content;
          if (content.includes('|')) {
            const parts = content.split('|');
            href = parts[0];
            text = parts[1];
          }
          // Normalize href (remove .md, lowercase, space to dash)
          href = '/' + href.replace(/\.md$/, '').toLowerCase().replace(/\s+/g, '-') + '/';
          
          let token = state.push('link_open', 'a', 1);
          token.attrs = [['href', href], ['class', 'wikilink']];
          
          token = state.push('text', '', 0);
          token.content = text;
          
          state.push('link_close', 'a', -1);
        }
        state.pos += match[0].length;
        return true;
      });
    });

  eleventyConfig.setLibrary("md", markdownLibrary);

  // Collections
  eleventyConfig.addCollection("docs", function(collectionApi) {
    return collectionApi.getFilteredByGlob("docs/**/*.md");
  });

  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("blog/posts/**/*.md").reverse();
  });

  // Grouped Navigation for Sidebar
  eleventyConfig.addCollection("groupedNav", function(collectionApi) {
    const docs = collectionApi.getFilteredByGlob("docs/**/*.md");
    const grouped = {};
    docs.forEach(page => {
      if (page.url === '/docs/') return; // Skip the index page itself
      
      const parts = page.url.split('/').filter(p => p);
      // parts is e.g. ['docs', 'programming', 'javascript']
      let category = "General";
      if (parts.length >= 3) {
        // Format category name: "web-development" -> "Web Development"
        category = parts[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      } else if (parts[1] === 'library') {
        category = "Library";
      }
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      
      let title = page.data.title;
      if (!title) {
        title = page.fileSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      
      grouped[category].push({
        title: title,
        url: page.url
      });
    });
    
    // Sort pages within categories alphabetically
    for (const key in grouped) {
      grouped[key].sort((a, b) => a.title.localeCompare(b.title));
    }
    
    // Sort the categories themselves alphabetically, keeping "General" at the top
    const sortedGrouped = {};
    const keys = Object.keys(grouped).sort();
    if (grouped["General"]) sortedGrouped["General"] = grouped["General"];
    keys.forEach(k => {
      if (k !== "General") sortedGrouped[k] = grouped[k];
    });
    
    return sortedGrouped;
  });

  // Backlinks Data Structure
  eleventyConfig.addCollection("backlinks", function(collectionApi) {
    const allPages = collectionApi.getAll();
    const backlinks = {}; // mapping of page URL to Array of referencing pages

    allPages.forEach(page => {
      // Ensure there's a key for each page
      if (!backlinks[page.url]) {
        backlinks[page.url] = [];
      }
      
      let content = "";
      if (!page.inputPath || typeof page.inputPath !== 'string') return;
      try {
        content = fs.readFileSync(page.inputPath, 'utf8');
      } catch(e) {
        return;
      }
      if (!content) return;

      // Find all [[wikilinks]] in this page's content
      const regex = /\[\[(.*?)\]\]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        let linkTarget = match[1].split('|')[0].replace(/\.md$/, '').toLowerCase().replace(/\s+/g, '-');
        
        // Find matching page by slug or fileSlug
        const targetPage = allPages.find(p => p.fileSlug.toLowerCase() === linkTarget || (p.url && p.url.includes(linkTarget)));
        if (targetPage) {
          if (!backlinks[targetPage.url]) {
            backlinks[targetPage.url] = [];
          }
          // Avoid duplicates
          if (!backlinks[targetPage.url].some(link => link.url === page.url)) {
            backlinks[targetPage.url].push({
              url: page.url,
              title: page.data.title || page.fileSlug
            });
          }
        }
      }
    });
    return backlinks;
  });

  eleventyConfig.addFilter("date", function(dateObj, format) {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    return d.toISOString().split('T')[0]; // Simple YYYY-MM-DD for now
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "public" // Eleventy output to public, matching our pagefind target
    },
    templateFormats: ["md", "njk"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};
