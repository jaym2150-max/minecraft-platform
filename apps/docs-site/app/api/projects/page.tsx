export default function ApiProjectsPage() {
  return (
    <article>
      <h1>Projects</h1>
      <p>
        The Projects API provides full CRUD access to user-created projects (mods, modpacks,
        plugins).
      </p>

      <h2>List projects</h2>
      <p>
        <code>GET /projects</code>
      </p>
      <p>Query parameters:</p>
      <ul>
        <li>
          <code>page</code> - Page number (default: 1)
        </li>
        <li>
          <code>limit</code> - Items per page (default: 20, max: 100)
        </li>
        <li>
          <code>search</code> - Search by title or description
        </li>
        <li>
          <code>category</code> - Filter by category slug
        </li>
        <li>
          <code>loader</code> - Filter by loader type
        </li>
        <li>
          <code>status</code> - Filter by status (default: PUBLISHED)
        </li>
        <li>
          <code>sort</code> - Sort field (downloads, updatedAt, createdAt, title)
        </li>
        <li>
          <code>order</code> - Sort order (asc, desc)
        </li>
      </ul>
      <pre>
        <code>GET /projects?search=sodium&loader=FABRIC&sort=downloads&order=desc</code>
      </pre>

      <h2>Get a project</h2>
      <p>
        <code>GET /projects/:slug</code>
      </p>
      <p>Returns full project details including author, category, loaders, and latest version.</p>

      <h2>Create a project</h2>
      <p>
        <code>POST /projects</code> (requires authentication)
      </p>
      <pre>
        <code>{`{
  "title": "My Awesome Mod",
  "description": "Adds awesome features to Minecraft",
  "body": "Long description with markdown...",
  "categoryId": "uuid",
  "iconUrl": "https://...",
  "clientSide": true,
  "serverSide": false
}`}</code>
      </pre>

      <h2>Update a project</h2>
      <p>
        <code>PATCH /projects/:id</code> (requires authentication and ownership)
      </p>
      <p>Updates the specified fields. Only the project author or an admin can update.</p>

      <h2>Delete a project</h2>
      <p>
        <code>DELETE /projects/:id</code> (requires authentication and ownership)
      </p>
      <p>Soft-deletes the project and all related records. This action cannot be undone.</p>

      <h2>Project dependencies</h2>
      <p>
        <code>GET /projects/:slug/dependencies</code> - Lists all dependencies for a project.
      </p>

      <h2>Project team</h2>
      <p>
        <code>GET /projects/:slug/team</code> - Lists all team members for a project.
      </p>

      <h2>Related projects</h2>
      <p>
        <code>GET /projects/:slug/related</code> - Lists related projects in the same category.
      </p>

      <h2>Response format</h2>
      <p>All responses follow a standard envelope:</p>
      <pre>
        <code>{`{
  "statusCode": 200,
  "message": "Success",
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 },
  "timestamp": "2026-06-01T12:00:00.000Z"
}`}</code>
      </pre>
    </article>
  );
}
