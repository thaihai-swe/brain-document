# JWT (JSON Web Tokens)

JWT is a compact, URL-safe means of representing claims between two parties.

## Structure

```
header.payload.signature
```

### Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload
```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1516242622
}
```

### Signature
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

## Usage Example

```javascript
// Node.js with jsonwebtoken
const jwt = require('jsonwebtoken');

// Create token
const token = jwt.sign(
  { userId: 123, role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Verify token
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decoded.userId);
} catch (err) {
  console.error('Invalid token');
}
```

## Best Practices

- Keep tokens short-lived
- Use strong secrets
- Don't store sensitive data in payload
- Validate on every request
- Use HTTPS only
- Implement token refresh
- Store securely (httpOnly cookies)

## Common Claims

- `iss`: Issuer
- `sub`: Subject (user ID)
- `aud`: Audience
- `exp`: Expiration time
- `iat`: Issued at
- `nbf`: Not before
