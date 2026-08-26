export default function UploadingGuidePage() {
  return (
    <article>
      <h1>Uploading Projects</h1>
      <p>
        A comprehensive guide to uploading, versioning, and managing your mod files on Minecraft
        Platform.
      </p>

      <h2>File Requirements</h2>
      <ul>
        <li>Maximum file size: 50 MB</li>
        <li>
          Supported formats: <code>.jar</code>, <code>.zip</code>
        </li>
        <li>Files are scanned for malware before being made available</li>
        <li>Each version must have a unique version number (e.g., "1.0.0")</li>
      </ul>

      <h2>Version Numbering</h2>
      <p>
        We follow <a href="https://semver.org">Semantic Versioning</a>:
      </p>
      <ul>
        <li>
          <code>1.0.0</code> - Major release (breaking changes)
        </li>
        <li>
          <code>1.1.0</code> - Minor release (new features)
        </li>
        <li>
          <code>1.1.1</code> - Patch (bug fixes)
        </li>
        <li>
          <code>1.0.0-beta.1</code> - Pre-release (add a hyphen)
        </li>
      </ul>

      <h2>Loader Compatibility</h2>
      <p>
        Each version must declare which loaders it supports. You can mark a version as supporting
        multiple loaders, but be sure to test with each one!
      </p>

      <h2>Best Practices</h2>
      <ol>
        <li>Always write a meaningful changelog for each version</li>
        <li>
          Use <code>git tags</code> in your repository to align with version numbers
        </li>
        <li>Test with the actual loader and Minecraft version before uploading</li>
        <li>
          Use <code>clientSide</code> and <code>serverSide</code> flags correctly
        </li>
        <li>
          Mark <code>required</code> dependencies appropriately
        </li>
      </ol>

      <h2>Updating a Project</h2>
      <p>
        To update an existing project, simply upload a new version. Users will be notified through
        the platform's notification system if they're watching your project.
      </p>

      <h2>Archiving vs Deleting</h2>
      <p>
        <strong>Archive</strong> a project to hide it from search and prevent new downloads while
        preserving existing data. <strong>Delete</strong> permanently removes the project and all
        its data. Use archive for deprecation, delete for takedowns.
      </p>
    </article>
  );
}
