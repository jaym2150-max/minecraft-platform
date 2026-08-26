export default function ApiVersionsPage() {
  return (
    <article>
      <h1>Versions</h1>
      <p>
        Versions are individual releases of a project. Each version has a file, changelog, and
        supported loaders.
      </p>

      <h2>List versions for a project</h2>
      <p>
        <code>GET /projects/:projectId/versions</code>
      </p>
      <p>Returns all versions for the given project, sorted by creation date (newest first).</p>

      <h2>Get a version</h2>
      <p>
        <code>GET /versions/:id</code>
      </p>

      <h2>Create a version</h2>
      <p>
        <code>POST /projects/:projectId/versions</code> (requires authentication and ownership)
      </p>
      <pre>
        <code>{`{
  "version": "1.0.0",
  "changelog": "Initial release",
  "fileUrl": "https://cdn.example.com/mymod-1.0.0.jar",
  "fileSize": 1024000,
  "hash": "sha256:abc123...",
  "loaders": ["FABRIC"],
  "minecraftVersionId": "uuid",
  "dependencies": [
    { "projectId": "uuid", "required": true }
  ]
}`}</code>
      </pre>

      <h2>Update a version</h2>
      <p>
        <code>PATCH /versions/:id</code> (requires authentication and ownership)
      </p>

      <h2>Delete a version</h2>
      <p>
        <code>DELETE /versions/:id</code> (requires authentication and ownership)
      </p>

      <h2>Download a version</h2>
      <p>
        <code>GET /versions/:id/download</code> - Increments the download counter and returns the
        file URL. The actual file is served directly from S3/MinIO.
      </p>
      <pre>
        <code>{`{
  "statusCode": 200,
  "data": { "url": "https://cdn.example.com/..." }
}`}</code>
      </pre>
    </article>
  );
}
