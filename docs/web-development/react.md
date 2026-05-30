# React

React is a JavaScript library for building user interfaces.

## Overview

React uses a component-based architecture and virtual DOM for efficient updates.

## Core Concepts

- **Components**: Reusable UI pieces
- **Props**: Data passed to components
- **State**: Component-managed data
- **Hooks**: Function component features
- **JSX**: JavaScript XML syntax

## Basic Example

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default Counter;
```

## Common Hooks

```jsx
// useState - state management
const [value, setValue] = useState(initialValue);

// useEffect - side effects
useEffect(() => {
  // Effect code
  return () => {
    // Cleanup
  };
}, [dependencies]);

// useContext - context consumption
const value = useContext(MyContext);

// useRef - mutable reference
const ref = useRef(initialValue);
```

## Best Practices

- Keep components small and focused
- Use functional components with hooks
- Lift state up when needed
- Memoize expensive computations
- Use keys in lists
