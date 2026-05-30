# Node.js

Node.js is a JavaScript runtime built on Chrome's V8 engine.

## Overview

Node.js enables JavaScript to run on the server side.

## Basic Server

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Express Framework

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.post('/api/users', (req, res) => {
  const user = req.body;
  res.status(201).json(user);
});

app.listen(3000);
```

## NPM Basics

```bash
# Initialize project
npm init -y

# Install dependencies
npm install express

# Install dev dependencies
npm install --save-dev nodemon

# Run scripts
npm start
npm test
```

## Best Practices

- Use async/await for async operations
- Handle errors properly
- Use environment variables
- Implement logging
- Use process managers (PM2)
