# Design Patterns

Design patterns are reusable solutions to common software design problems.

## Creational Patterns

### Singleton
Ensures a class has only one instance.

```javascript
class Database {
  static instance = null;
  
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}
```

### Factory
Creates objects without specifying exact class.

```javascript
class UserFactory {
  createUser(type) {
    switch(type) {
      case 'admin': return new AdminUser();
      case 'guest': return new GuestUser();
      default: return new RegularUser();
    }
  }
}
```

## Structural Patterns

### Adapter
Allows incompatible interfaces to work together.

### Decorator
Adds behavior to objects dynamically.

## Behavioral Patterns

### Observer
Defines one-to-many dependency between objects.

```javascript
class EventEmitter {
  constructor() {
    this.listeners = {};
  }
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}
```

### Strategy
Defines family of algorithms, makes them interchangeable.

## When to Use

- Use patterns to solve specific problems
- Don't force patterns where they don't fit
- Understand the trade-offs
- Keep it simple first
