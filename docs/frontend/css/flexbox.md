# CSS Flexbox

Flexbox is a one-dimensional layout method for arranging items.

## Container Properties

```css
.container {
  display: flex;
  flex-direction: row; /* row | column */
  justify-content: center; /* flex-start | flex-end | center | space-between */
  align-items: center; /* flex-start | flex-end | center | stretch */
  gap: 16px;
}
```

## Item Properties

```css
.item {
  flex: 1; /* flex-grow flex-shrink flex-basis */
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: auto;
  align-self: flex-start;
}
```

## Common Patterns

### Center Everything
```css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### Equal Width Columns
```css
.columns {
  display: flex;
  gap: 20px;
}

.column {
  flex: 1;
}
```

### Responsive Navigation
```css
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

## When to Use

- One-dimensional layouts
- Navigation bars
- Card layouts
- Centering content
- Responsive components
