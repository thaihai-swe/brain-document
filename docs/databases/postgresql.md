# PostgreSQL

PostgreSQL is a powerful, open-source relational database system.

## Overview

PostgreSQL is known for its reliability, feature robustness, and performance.

## Key Features

- ACID compliance
- Advanced data types (JSON, arrays, hstore)
- Full-text search
- Powerful indexing
- Extensible with custom functions

## Basic Commands

```sql
-- Create database
CREATE DATABASE myapp;

-- Create table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert data
INSERT INTO users (email) VALUES ('user@example.com');

-- Query data
SELECT * FROM users WHERE email LIKE '%@example.com';
```

## Best Practices

- Use indexes on frequently queried columns
- Regular VACUUM and ANALYZE
- Connection pooling for production
- Backup strategy with pg_dump
