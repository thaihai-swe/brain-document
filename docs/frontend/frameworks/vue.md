# Vue.js

Vue.js is a progressive JavaScript framework for building user interfaces.

## Basic Component

```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <button @click="increment">Count: {{ count }}</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: 'Hello Vue',
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>

<style scoped>
button {
  padding: 8px 16px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
}
</style>
```

## Composition API

```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

function increment() {
  count.value++
}
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Doubled: {{ doubled }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>
```

## Key Features

- Reactive data binding
- Component-based architecture
- Single-file components
- Virtual DOM
- Composition API
- Easy to learn

## When to Use

- Progressive enhancement
- Single-page applications
- Interactive UIs
- Rapid prototyping
