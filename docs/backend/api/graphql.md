# GraphQL

GraphQL is a query language for APIs and a runtime for executing queries.

## Overview

GraphQL allows clients to request exactly the data they need.

## Basic Query

```graphql
query {
  user(id: "123") {
    name
    email
    posts {
      title
      createdAt
    }
  }
}
```

## Mutations

```graphql
mutation {
  createUser(input: {
    name: "John Doe"
    email: "john@example.com"
  }) {
    id
    name
  }
}
```

## Schema Definition

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
}

type Query {
  user(id: ID!): User
  users: [User!]!
}
```

## Advantages

- Request exactly what you need
- Single endpoint
- Strong typing
- Introspection
- Real-time with subscriptions

## When to Use

- Complex data requirements
- Mobile apps (reduce bandwidth)
- Rapid frontend development
- Multiple clients with different needs
