export default function SdkUsagePage() {
  return (
    <article>
      <h1>SDK Usage</h1>
      <p>Common patterns and recipes for using the SDK in your application.</p>

      <h2>Listing projects with filters</h2>
      <pre>
        <code>{`const result = await sdk.listProjects({
  search: 'performance',
  loader: 'FABRIC',
  category: 'performance',
  sort: 'downloads',
  order: 'desc',
  page: 1,
  limit: 20,
});

for (const project of result.data) {
  console.log(project.title, project.downloads);
}`}</code>
      </pre>

      <h2>Creating a project</h2>
      <pre>
        <code>{`const project = await sdk.createProject({
  title: 'My Awesome Mod',
  description: 'A short description',
  body: 'Long markdown description...',
  categoryId: 'category-uuid',
  clientSide: true,
  serverSide: false,
});`}</code>
      </pre>

      <h2>Uploading a version</h2>
      <pre>
        <code>{`// Step 1: Get a presigned upload URL
const uploadResult = await fetch('/api/v1/uploads/project/' + projectId, {
  method: 'POST',
  headers: { 'Content-Type': 'application/octet-stream' },
  body: fileBuffer,
});
const { data } = await uploadResult.json();

// Step 2: Wait for virus scan to complete
const status = await sdk.getUploadStatus(data.uploadId);

// Step 3: Create a version pointing to the uploaded file
await sdk.createVersion(projectId, {
  version: '1.0.0',
  fileUrl: data.fileUrl,
  fileSize: data.size,
  hash: data.hash,
  loaders: ['FABRIC'],
});`}</code>
      </pre>

      <h2>Searching</h2>
      <pre>
        <code>{`const results = await sdk.search('shaders', { page: 1, limit: 10 });
console.log(\`Found \${results.meta.total} results in \${results.meta.processingTimeMs}ms\`);`}</code>
      </pre>

      <h2>React integration with TanStack Query</h2>
      <pre>
        <code>{`import { useQuery } from '@tanstack/react-query';
import { sdk } from './sdk';

function useProjects(filters) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => sdk.listProjects(filters).then(r => r.data),
  });
}`}</code>
      </pre>

      <h2>Server-side usage</h2>
      <p>On the server, you'll want to use a per-user SDK instance with the user's auth token:</p>
      <pre>
        <code>{`import { cookies } from 'next/headers';
import { McpSDK } from '@mcp/sdk';

export async function getServerProjects() {
  const token = cookies().get('token')?.value;
  const sdk = new McpSDK(process.env.API_URL);
  if (token) sdk.setAuthToken(token);

  return sdk.listProjects({ author: 'me' });
}`}</code>
      </pre>
    </article>
  );
}
