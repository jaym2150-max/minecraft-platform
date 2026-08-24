export default function DocsHomePage() {
  return (
    <article>
      <h1>Minecraft Platform Documentation</h1>
      <p>
        Welcome to the official documentation for the Minecraft Platform. This guide will help
        you understand the platform, integrate with our API, and get the most out of your
        experience.
      </p>

      <h2>What is Minecraft Platform?</h2>
      <p>
        Minecraft Platform is a hosting service for Minecraft mods, modpacks, and plugins.
        Inspired by CurseForge and Modrinth, it provides a fast, secure, and developer-friendly
        environment for mod authors and players alike.
      </p>

      <h2>Key Features</h2>
      <ul>
        <li>
          <strong>Free hosting</strong> for all your mods and modpacks, with generous bandwidth
        </li>
        <li>
          <strong>Multi-loader support</strong>: Fabric, Forge, NeoForge, Quilt, Bukkit, Spigot, Paper, and Purpur
        </li>
        <li>
          <strong>Automatic malware scanning</strong> using ClamAV
        </li>
        <li>
          <strong>Powerful search</strong> powered by Meilisearch with full-text and faceted search
        </li>
        <li>
          <strong>Public API</strong> for programmatic access to all platform features
        </li>
        <li>
          <strong>TypeScript SDK</strong> for easy integration
        </li>
        <li>
          <strong>Team collaboration</strong> with role-based access control
        </li>
        <li>
          <strong>Detailed analytics</strong> for downloads, views, and user engagement
        </li>
      </ul>

      <h2>Getting Started</h2>
      <p>
        New to the platform? Start with our{' '}
        <a href="/quickstart">Quickstart guide</a> to create your first project in minutes.
      </p>

      <h2>For Developers</h2>
      <p>
        Building an integration? Check out our <a href="/api/auth">API reference</a> and{' '}
        <a href="/sdk/installation">TypeScript SDK</a> documentation.
      </p>

      <h2>Need Help?</h2>
      <p>
        Have questions? Join our community Discord or open an issue on GitHub. Our team and
        community members are happy to help.
      </p>

      <blockquote>
        <strong>Note:</strong> This documentation is for the latest version of the platform. For
        older versions, see our <a href="/guides/migration">migration guides</a>.
      </blockquote>
    </article>
  );
}
