# OAuth 2.0

OAuth 2.0 is an authorization framework for delegated access.

## Overview

OAuth allows third-party applications to access user resources without exposing credentials.

## Grant Types

### Authorization Code Flow
```
1. User → Authorization Server (login)
2. Authorization Server → Client (code)
3. Client → Authorization Server (code + secret)
4. Authorization Server → Client (access token)
5. Client → Resource Server (access token)
```

### Client Credentials Flow
```
1. Client → Authorization Server (client_id + secret)
2. Authorization Server → Client (access token)
3. Client → Resource Server (access token)
```

## Token Types

- **Access Token**: Short-lived, grants access
- **Refresh Token**: Long-lived, gets new access tokens
- **ID Token**: Contains user information (OpenID Connect)

## Example Request

```http
POST /oauth/token HTTP/1.1
Host: auth.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTH_CODE
&redirect_uri=https://app.example.com/callback
&client_id=CLIENT_ID
&client_secret=CLIENT_SECRET
```

## Security Best Practices

- Use HTTPS only
- Validate redirect URIs
- Short-lived access tokens
- Rotate refresh tokens
- Use PKCE for public clients
- Store tokens securely
