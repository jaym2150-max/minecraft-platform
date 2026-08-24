export default function QuickstartPage() {
  return (
    <article>
      <h1>Quickstart</h1>
      <p>
        This guide walks you through publishing your first mod on Minecraft Platform in under 10
        minutes.
      </p>

      <h2>1. Create an account</h2>
      <p>
        Head over to the <a href="http://localhost:3000/auth/register">registration page</a> and
        create an account. All you need is a valid email address.
      </p>

      <h2>2. Create your project</h2>
      <p>
        Once signed in, go to your <a href="http://localhost:3000/dashboard/projects">Dashboard</a>{' '}
        and click "New Project". Fill in the basic details:
      </p>
      <ul>
        <li><strong>Title</strong> - The name of your mod (e.g., "Sodium")</li>
        <li><strong>Description</strong> - A short, one-line summary</li>
        <li><strong>Body</strong> - Detailed description with markdown support</li>
        <li><strong>Category</strong> - Where your mod fits best</li>
        <li><strong>Loaders</strong> - The mod loaders your mod supports</li>
      </ul>

      <h2>3. Upload your first version</h2>
      <p>
        Navigate to the <a href="http://localhost:3000/dashboard/uploads">Uploads page</a> and
        drop your mod file (a <code>.jar</code> or <code>.zip</code>). You'll need to provide:
      </p>
      <ul>
        <li>Version number (e.g., "1.0.0")</li>
        <li>Target Minecraft version</li>
        <li>Supported loaders</li>
        <li>Changelog (optional but recommended)</li>
      </ul>

      <h2>4. Wait for processing</h2>
      <p>
        After uploading, your file goes through our pipeline:
      </p>
      <ol>
        <li><strong>Upload</strong> - Stored in S3-compatible storage (MinIO)</li>
        <li><strong>Virus scan</strong> - Scanned with ClamAV</li>
        <li><strong>Indexing</strong> - Added to our search index</li>
        <li><strong>Live</strong> - Your version is now downloadable!</li>
      </ol>

      <h2>5. Share with the world</h2>
      <p>
        Once live, share your project URL with the community. Your project will appear in
        search results, category pages, and the home page if featured.
      </p>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/guides/teams">Set up a team</a> to collaborate with other developers</li>
        <li><a href="/guides/moderation">Learn about content moderation</a></li>
        <li><a href="/api/auth">Use the API</a> to automate your workflow</li>
      </ul>
    </article>
  );
}
