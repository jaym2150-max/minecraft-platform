export default function ApiAuthPage() {
  return (
    <article>
      <h1>Authentication</h1>
      <p>
        The API uses JWT-based authentication. All authenticated endpoints expect a Bearer token in
        the <code>Authorization</code> header.
      </p>

      <h2>Base URL</h2>
      <pre>
        <code>http://localhost:4000/api/v1</code>
      </pre>

      <h2>Register a new account</h2>
      <p>
        <code>POST /auth/register</code>
      </p>
      <pre>
        <code>{`{
  "username": "myusername",
  "email": "me@example.com",
  "password": "SecureP@ss123"
}`}</code>
      </pre>

      <p>The response includes a JWT token and the user object:</p>
      <pre>
        <code>{`{
  "statusCode": 201,
  "data": {
    "user": {
      "id": "uuid",
      "username": "myusername",
      "email": "me@example.com",
      "role": "USER"
    },
    "token": "eyJhbGc..."
  }
}`}</code>
      </pre>

      <h2>Login</h2>
      <p>
        <code>POST /auth/login</code>
      </p>
      <pre>
        <code>{`{
  "email": "me@example.com",
  "password": "SecureP@ss123"
}`}</code>
      </pre>

      <h2>Get current user</h2>
      <p>
        <code>GET /auth/me</code> (requires authentication)
      </p>
      <pre>
        <code>
          curl -H "Authorization: Bearer YOUR_TOKEN" \\ http://localhost:4000/api/v1/auth/me
        </code>
      </pre>

      <h2>Logout</h2>
      <p>
        <code>POST /auth/logout</code> - Clears the auth cookie and invalidates the session.
      </p>

      <h2>Password reset</h2>
      <p>
        <code>POST /auth/forgot-password</code> - Sends a password reset email to the user.
      </p>
      <pre>
        <code>{`{
  "email": "me@example.com"
}`}</code>
      </pre>

      <p>
        <code>POST /auth/reset-password</code> - Completes the password reset using a token from the
        email.
      </p>
      <pre>
        <code>{`{
  "token": "reset-token-from-email",
  "password": "NewSecureP@ss456"
}`}</code>
      </pre>

      <h2>Token expiration</h2>
      <p>
        Tokens expire after <code>JWT_EXPIRATION</code> (default: 15 minutes). When a token expires,
        you'll receive a <code>401 Unauthorized</code> response. The web client handles this
        automatically by redirecting to the login page.
      </p>

      <h2>Rate limits</h2>
      <p>
        All API endpoints are rate limited. The default is 100 requests per minute per IP. The{' '}
        <code>Retry-After</code> header indicates how long to wait before retrying.
      </p>
    </article>
  );
}
