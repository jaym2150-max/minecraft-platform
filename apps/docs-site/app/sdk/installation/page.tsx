export default function SdkInstallationPage() {
  return (
    <article>
      <h1>SDK Installation</h1>
      <p>
        The official TypeScript SDK is published as <code>@mcp/sdk</code> and provides a
        strongly-typed wrapper around the REST API.
      </p>

      <h2>Install</h2>
      <pre>
        <code>{`# npm
npm install @mcp/sdk

# pnpm
pnpm add @mcp/sdk

# yarn
yarn add @mcp/sdk`}</code>
      </pre>

      <h2>Initialize</h2>
      <pre>
        <code>{`import { McpSDK } from '@mcp/sdk';

const sdk = new McpSDK('https://api.minecraftplatform.com/api/v1');

// Or for local development
const devSdk = new McpSDK('http://localhost:4000/api/v1');`}</code>
      </pre>

      <h2>Authenticate</h2>
      <pre>
        <code>{`const result = await sdk.login('user@example.com', 'password123');
const { user, token } = result.data;

// Set the token for subsequent requests
sdk.setAuthToken(token);

// Later, when the user logs out
sdk.clearAuthToken();`}</code>
      </pre>

      <h2>Error handling</h2>
      <p>
        The SDK throws <code>ApiError</code> on non-2xx responses:
      </p>
      <pre>
        <code>{`import { ApiError } from '@mcp/utils/api-client';

try {
  await sdk.createProject({ title: 'My Mod', description: '...' });
} catch (err) {
  if (err instanceof ApiError) {
    if (err.statusCode === 401) {
      // Not authenticated
    } else if (err.statusCode === 403) {
      // Not authorized
    } else {
      // Other error
    }
  }
}`}</code>
      </pre>

      <h2>TypeScript Types</h2>
      <p>
        All types are exported from <code>@mcp/types</code>:
      </p>
      <pre>
        <code>{`import { Project, User, ProjectVersion, LoaderType } from '@mcp/types';

const project: Project = await sdk.getProject('sodium').then(r => r.data);`}</code>
      </pre>
    </article>
  );
}
