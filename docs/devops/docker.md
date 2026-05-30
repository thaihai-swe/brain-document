# Docker

Docker is a platform for developing, shipping, and running applications in containers.

## Overview

Containers package applications with their dependencies, ensuring consistency across environments.

## Basic Commands

```bash
# Build image
docker build -t myapp:latest .

# Run container
docker run -d -p 8080:80 --name myapp myapp:latest

# List containers
docker ps -a

# View logs
docker logs myapp

# Stop and remove
docker stop myapp
docker rm myapp

# Clean up
docker system prune -a
```

## Dockerfile Example

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
```

## Best Practices

- Use multi-stage builds
- Minimize layer count
- Use .dockerignore
- Don't run as root
- Keep images small
