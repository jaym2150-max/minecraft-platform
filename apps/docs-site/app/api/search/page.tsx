export default function ApiSearchPage() {
  return (
    <article>
      <h1>Search</h1>
      <p>
        The search API is powered by Meilisearch and provides fast, typo-tolerant full-text
        search across all published projects.
      </p>

      <h2>Search projects</h2>
      <p>
        <code>GET /search</code>
      </p>
      <p>Query parameters:</p>
      <ul>
        <li><code>q</code> - Search query (can be empty to list all)</li>
        <li><code>page</code> - Page number (default: 1)</li>
        <li><code>limit</code> - Items per page (default: 20)</li>
        <li><code>category</code> - Filter by category ID</li>
        <li><code>loader</code> - Filter by loader type</li>
        <li><code>sort</code> - Sort field (downloads, views, createdAt)</li>
      </ul>
      <pre><code>GET /search?q=performance&loader=FABRIC&sort=downloads</code></pre>

      <h2>Response</h2>
      <pre><code>{`{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "title": "Sodium",
      "slug": "sodium",
      "description": "...",
      "downloads": 12500000,
      "views": 45000000,
      "authorName": "caffeinemc",
      "categoryName": "Performance",
      "loaders": ["FABRIC"]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3,
    "query": "performance",
    "processingTimeMs": 4
  }
}`}</code></pre>

      <h2>Reindex (admin only)</h2>
      <p>
        <code>POST /search/reindex</code> - Rebuilds the search index from scratch. Useful after
        bulk imports or schema changes. Requires admin role.
      </p>
    </article>
  );
}
