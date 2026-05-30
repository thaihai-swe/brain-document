# TypeScript

TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.

## Overview

TypeScript adds static typing to JavaScript, catching errors at compile time.

## Basic Types

```typescript
// Primitives
let name: string = "John";
let age: number = 30;
let isActive: boolean = true;

// Arrays
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];

// Objects
interface User {
  id: number;
  name: string;
  email?: string; // Optional
}

const user: User = {
  id: 1,
  name: "John Doe"
};

// Functions
function greet(name: string): string {
  return `Hello, ${name}!`;
}

// Union types
let value: string | number;
value = "hello";
value = 42;
```

## Advanced Types

```typescript
// Generics
function identity<T>(arg: T): T {
  return arg;
}

// Type aliases
type ID = string | number;

// Intersection types
type Admin = User & { role: "admin" };

// Utility types
type PartialUser = Partial<User>;
type ReadonlyUser = Readonly<User>;
```

## Benefits

- Early error detection
- Better IDE support
- Self-documenting code
- Safer refactoring
- Enhanced team collaboration
