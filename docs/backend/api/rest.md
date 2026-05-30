# REST API Design

Best practices for designing RESTful APIs.

## Core Principles

- **Resource-based**: URLs represent resources
- **HTTP methods**: GET, POST, PUT, PATCH, DELETE
- **Stateless**: Each request contains all needed information
- **JSON format**: Standard data exchange format

## URL Structure

```
GET    /api/users           # List users
GET    /api/users/123       # Get user
POST   /api/users           # Create user
PUT    /api/users/123       # Update user
PATCH  /api/users/123       # Partial update
DELETE /api/users/123       # Delete user
```

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Server Error |

## Versioning

```
# URL versioning
/api/v1/users
/api/v2/users

# Header versioning
Accept: application/vnd.myapi.v1+json
```

## Best Practices

- Use nouns, not verbs in URLs
- Use plural resource names
- Return appropriate status codes
- Implement pagination for lists
- Use filtering and sorting
- Document with OpenAPI/Swagger
