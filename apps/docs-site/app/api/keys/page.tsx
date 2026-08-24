export default function ApiKeysPage() {
  return (
    <article>
      <h1>API Keys - Apply for API Access</h1>
      <p>
        Automate uploads, sync with CI, or build a launcher integration. API keys are long-lived
        bearer tokens scoped to specific permissions - separate from your JWT session. Like
        CurseForge&apos;s <em>Apply for an API Key</em>, our keys are self-serve: create one instantly in your
        dashboard, no manual approval.
      </p>

      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '8px', margin: '16px 0' }}>
        <strong>Self-serve:</strong> No application form. Go to <code>Settings → API Keys</code> or{' '}
        <code>POST /api-keys</code> to create one now. Keys are free for all authenticated users.
      </div>

      <h2>How to create a key</h2>
      <h3>Dashboard (recommended)</h3>
      <ol>
        <li>Sign in and open <code>/settings</code> → <strong>API Keys</strong> (or <code>/dashboard/api-keys</code> if enabled).</li>
        <li>Click <strong>New API Key</strong>, enter a name (e.g. <code>my-launcher</code>), select scopes, optionally set IP allowlist and expiry.</li>
        <li>Copy the secret once - it is shown only at creation (<code>mcp_...</code>). Store it in <code>.env</code> as <code>MCP_API_KEY</code>.</li>
      </ol>

      <h3>Via API (authenticated JWT required)</h3>
      <pre>
        <code>{`curl -X POST http://localhost:4000/api/v1/api-keys \\
  -H "Authorization: Bearer YOUR_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "ci-upload",
    "scopes": ["PROJECT_WRITE", "VERSION_WRITE"],
    "ipAllowlist": ["203.0.113.10/32"],
    "expiresAt": "2027-01-01T00:00:00Z"
  }'
# response
{
  "statusCode": 201,
  "data": {
    "id": "uuid",
    "name": "ci-upload",
    "key": "mcp_abc123... (store now)",
    "lastChars": "...123",
    "scopes": ["PROJECT_WRITE","VERSION_WRITE"]
  }
}`}</code>
      </pre>

      <h2>Scopes</h2>
      <p>Keys are scoped per CurseForge&apos;s 3rd-party T&C - least-privilege:</p>
      <table>
        <thead>
          <tr>
            <th>Scope</th>
            <th>Allows</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>READ</code>, <code>PROJECT_READ</code>, <code>VERSION_READ</code>
            </td>
            <td>List/get projects &amp; versions, search</td>
          </tr>
          <tr>
            <td>
              <code>WRITE</code>, <code>PROJECT_WRITE</code>, <code>VERSION_WRITE</code>
            </td>
            <td>Create/update projects &amp; versions (requires upload flow)</td>
          </tr>
          <tr>
            <td>
              <code>USER_READ</code> / <code>USER_WRITE</code>
            </td>
            <td>Read/update own profile</td>
          </tr>
          <tr>
            <td>
              <code>ANALYTICS_READ</code>
            </td>
            <td>Read project analytics</td>
          </tr>
          <tr>
            <td>
              <code>ADMIN</code>
            </td>
            <td>Moderation &amp; admin endpoints (Owner/Admin only)</td>
          </tr>
        </tbody>
      </table>
      <p>
        Default new key gets <code>[READ]</code>. Add only what you need. The SDK validates scopes
        server-side - a key with <code>READ</code> cannot <code>POST /projects</code> (403).
      </p>

      <h2>Rate limits &amp; tiers</h2>
      <p>
        Every key has a <code>rateLimitTier</code> (<code>BASIC</code> default, <code>PRO</code>,{' '}
        <code>ENTERPRISE</code>) enforced by the API gateway. Like CurseForge, tiers are per-key,
        not per-user - create separate keys for separate services.
      </p>
      <ul>
        <li>
          <strong>BASIC</strong>: ~60 req/min (default, free)
        </li>
        <li>
          <strong>PRO</strong>: higher burst for CI/launcher sync (contact via Discord or raise tier in dashboard when enabled)
        </li>
        <li>
          <strong>IP allowlist</strong>: restrict key to one IP/CIDR - requests from other IPs get 403 even with valid key.
        </li>
      </ul>

      <h2>Using the key</h2>
      <p>Send as Bearer header on every request (works with SDK or curl):</p>
      <pre>
        <code>{`# curl
curl -H "Authorization: Bearer mcp_abc123..." \\
     http://localhost:4000/api/v1/projects?limit=5

# SDK (Node/CI) - bypasses httpOnly cookie flow
import { McpSDK } from '@mcp/sdk';
const sdk = new McpSDK('http://localhost:4000/api/v1');
sdk.setAuthToken('mcp_abc123...');
await sdk.listProjects({ limit: 5 });

// Upload via CI (requires VERSION_WRITE)
import { McpSDK } from '@mcp/sdk';
const sdk = new McpSDK(process.env.MCP_API_URL!);
sdk.setAuthToken(process.env.MCP_API_KEY!);
const upload = await sdk.uploadFile(projectId, file);
await sdk.createVersion(projectId, { version: '1.0.0', uploadId: upload.data.uploadId, loaders: ['FABRIC'] });
`}</code>
      </pre>
      <p>
        Keys are <strong>not</strong> cookies - they work in headless/CI where <code>credentials: include</code>{' '}
        is unavailable. Browser sessions should still use the httpOnly JWT cookie (auto-sent).
      </p>

      <h2>Revoking &amp; rotation</h2>
      <pre>
        <code>{`# List keys
GET /api-keys
# Revoke
DELETE /api-keys/:id
# Keys show lastChars + lastUsedAt so you can audit usage`}</code>
      </pre>
      <p>
        Rotate by creating a new key with same scopes, deploying it, then deleting the old one. A
        revoked key fails closed immediately (401).
      </p>

      <h2>Terms</h2>
      <ul>
        <li>Keys are per-user, not per-organization. Do not share.</li>
        <li>Do not commit keys to git - use env vars or secret store.</li>
        <li>Abuse (scraping, high-rate polling) may be rate-limited or revoked per 3rd-party T&C.</li>
      </ul>

      <blockquote>
        <strong>Need help?</strong> Join Discord or open a GitHub issue. We mirror CurseForge&apos;s
        docs structure so existing integrations port easily - see <a href="/api/projects">Projects</a>,{' '}
        <a href="/api/versions">Versions</a>, <a href="/api/search">Search</a>.
      </blockquote>
    </article>
  );
}
