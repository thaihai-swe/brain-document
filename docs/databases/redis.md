# Redis

Redis is an in-memory data structure store used as a database, cache, and message broker.

## Overview

Redis provides high performance for read and write operations with support for various data structures.

## Data Structures

- **Strings**: Simple key-value pairs
- **Lists**: Ordered collections
- **Sets**: Unordered unique collections
- **Hashes**: Field-value pairs
- **Sorted Sets**: Ordered sets with scores

## Common Use Cases

```bash
# Caching
SET user:1000 "John Doe"
GET user:1000
EXPIRE user:1000 3600

# Session storage
HSET session:abc123 user_id 1000
HSET session:abc123 last_seen "2026-05-30"
HGETALL session:abc123

# Rate limiting
INCR api:requests:user:1000
EXPIRE api:requests:user:1000 60
```

## Performance Tips

- Use pipelining for multiple commands
- Choose appropriate data structures
- Monitor memory usage
- Use Redis Cluster for scaling
