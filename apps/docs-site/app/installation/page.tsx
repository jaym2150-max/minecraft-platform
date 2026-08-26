export default function InstallationPage() {
  return (
    <article>
      <h1>Installation</h1>
      <p>
        Want to self-host Minecraft Platform or run it locally for development? This guide covers
        the prerequisites and setup steps.
      </p>

      <h2>Prerequisites</h2>
      <ul>
        <li>
          <strong>Node.js</strong> 20.x or higher
        </li>
        <li>
          <strong>pnpm</strong> 9.x or higher (or use npm/yarn if you prefer)
        </li>
        <li>
          <strong>Docker</strong> and Docker Compose (recommended)
        </li>
        <li>4 GB of RAM minimum (8 GB recommended for production)</li>
        <li>PostgreSQL 16+ (or use the included Docker setup)</li>
      </ul>

      <h2>Quick Start with Docker</h2>
      <p>The fastest way to get started is using Docker Compose:</p>

      <pre>
        <code>{`# 1. Clone the repository
git clone https://github.com/your-org/minecraft-platform.git
cd minecraft-platform

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env

# 4. Start infrastructure services
pnpm docker:up

# 5. Generate Prisma client
pnpm db:generate

# 6. Run database migrations
pnpm db:migrate

# 7. Seed the database (optional)
pnpm db:seed

# 8. Start all apps in development mode
pnpm dev`}</code>
      </pre>

      <h2>Architecture Overview</h2>
      <p>The platform is a pnpm/Turbo monorepo with these components:</p>
      <ul>
        <li>
          <strong>apps/web</strong> - Next.js frontend (port 3000)
        </li>
        <li>
          <strong>apps/api</strong> - NestJS backend (port 4000)
        </li>
        <li>
          <strong>apps/admin</strong> - Admin panel (port 3001)
        </li>
        <li>
          <strong>apps/docs-site</strong> - This documentation (port 3002)
        </li>
        <li>
          <strong>services/*</strong> - Background workers (uploads, virus scanning, etc.)
        </li>
      </ul>

      <h2>Required Services</h2>
      <p>By default, Docker Compose starts the following services:</p>
      <ul>
        <li>
          <strong>PostgreSQL</strong> on port 5432 - Primary database
        </li>
        <li>
          <strong>Redis</strong> on port 6379 - Caching and queues
        </li>
        <li>
          <strong>Meilisearch</strong> on port 7700 - Search engine
        </li>
        <li>
          <strong>MinIO</strong> on port 9000 (console: 9001) - Object storage
        </li>
        <li>
          <strong>ClamAV</strong> on port 3310 - Malware scanning
        </li>
      </ul>

      <h2>Production Deployment</h2>
      <p>
        For production deployments, we recommend using Kubernetes with the manifests in{' '}
        <code>infrastructure/kubernetes/</code>. See our <a href="/deployment">deployment guide</a>{' '}
        for detailed instructions.
      </p>

      <h2>Troubleshooting</h2>
      <h3>Database connection errors</h3>
      <p>
        Make sure PostgreSQL is running (<code>docker ps</code> should show it) and the{' '}
        <code>DATABASE_URL</code> in your <code>.env</code> file is correct.
      </p>

      <h3>Port conflicts</h3>
      <p>
        If any of the default ports are already in use, edit <code>docker-compose.yml</code> and the{' '}
        <code>.env</code> file to use different ports.
      </p>
    </article>
  );
}
