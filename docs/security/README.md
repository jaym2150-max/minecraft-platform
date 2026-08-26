# Security

Security best practices for Minecraft Platform.

## Authentication

- Passwords are hashed with **bcrypt** (10 rounds by default)
- JWT tokens expire after 15 minutes (configurable via `JWT_EXPIRATION`)
- Refresh tokens (when implemented) will expire after 7 days
- All auth endpoints are rate-limited

## Authorization

Role-based access control (RBAC) is enforced via NestJS guards:

- `JwtAuthGuard` - Requires valid JWT
- `RolesGuard` - Checks user role against `@Roles()` decorator
- `@Public()` - Marks endpoints as not requiring auth
- `@CurrentUser()` - Injects the authenticated user

Roles hierarchy (from least to most privileged):

- `USER` - Default
- `MODERATOR` - Can resolve reports
- `ADMIN` - Full platform management
- `OWNER` - Root access

## File Upload Security

All uploaded files go through multiple security layers:

1. **Size limit** - 50 MB hard cap
2. **MIME type validation** - Only JAR/ZIP allowed
3. **ClamAV scan** - Signature-based malware detection
4. **Heuristic analysis** - Catches format anomalies
5. **Sandboxed processing** - Workers run in isolated processes

## Network Security

- **Helmet** middleware sets secure HTTP headers
- **CORS** is restricted to known origins only
- **Rate limiting** via `@nestjs/throttler` (100 req/min default)
- **Compression** for response payloads
- **TLS** required in production (terminate at reverse proxy)

## Data Protection

- Passwords are never returned in API responses
- All sensitive fields (password hashes, OAuth tokens) are stripped from response DTOs
- User data is GDPR-compliant (exportable, deletable on request)
- Database backups are encrypted at rest

## Secret Management

- Never commit secrets to version control
- Use environment variables for all sensitive config
- Rotate `JWT_SECRET` periodically (forces all users to re-login)
- Use managed secret stores (AWS Secrets Manager, HashiCorp Vault) in production

## Vulnerability Reporting

Found a security issue? Please email security@minecraftplatform.com (do not create a public issue).

We follow responsible disclosure and aim to acknowledge reports within 24 hours.
