---
layout: layout.njk
title: Blog
---
# Blog

Welcome to my blog! Here you'll find articles, tutorials, and updates about my learning journey.

## Recent Posts

Check out the latest posts below, or browse by [category](categories/) or [archive](archive/).

<ul class="post-list">
{% for post in collections.posts %}
  <li>
    <a href="{{ post.url | url }}">{{ post.data.title | default(post.fileSlug) }}</a>
    <small style="color: var(--bd-text-muted);"> — {{ post.data.date | date("yyyy-MM-dd") }}</small>
  </li>
{% else %}
  <li>No posts found yet.</li>
{% endfor %}
</ul>
