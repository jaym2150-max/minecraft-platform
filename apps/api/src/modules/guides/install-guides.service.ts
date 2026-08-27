import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

const PLACEHOLDER_RE =
  /\{\{\s*(projectName|loader|loaderVersion|gameVersion|client|server|filename|version)\s*\}\}/g;

function formatLoaderVersion(
  loaderType: string | null,
  loaderRows: Array<{ versionString: string | null }>,
): string | null {
  if (loaderRows.length === 0) return null;
  // Prefer the most recent row whose game-version string is what the user
  // has installed; if a loader version was attached separately it'd land
  // here too. For the template we just expose the latest known versionString
  // (game version) — the loader runtime version isn't stored yet.
  return loaderRows[0].versionString ?? null;
}

@Injectable()
export class InstallGuidesService {
  private readonly logger = new Logger(InstallGuidesService.name);

  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.installGuideTemplate.findMany({
      orderBy: [{ recommended: 'desc' }, { loader: 'asc' }],
    });
  }

  async get(id: string) {
    const tpl = await this.prisma.installGuideTemplate.findUnique({ where: { id } });
    if (!tpl) throw new NotFoundException(`Install guide template "${id}" not found`);
    return tpl;
  }

  async create(data: {
    loader: string;
    title: string;
    excerpt?: string;
    body: string;
    recommended?: boolean;
  }) {
    return this.prisma.installGuideTemplate.create({
      data: { ...data, recommended: data.recommended ?? false },
    });
  }

  async update(
    id: string,
    data: {
      loader?: string;
      title?: string;
      excerpt?: string;
      body?: string;
      recommended?: boolean;
    },
  ) {
    const existing = await this.prisma.installGuideTemplate.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Install guide template "${id}" not found`);
    return this.prisma.installGuideTemplate.update({ where: { id }, data });
  }

  async remove(id: string) {
    const existing = await this.prisma.installGuideTemplate.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Install guide template "${id}" not found`);
    await this.prisma.installGuideTemplate.delete({ where: { id } });
  }

  async seedDefaults() {
    const defaults = [
      {
        loader: 'FABRIC',
        title: 'Install with Fabric Loader',
        excerpt:
          'Fabric Loader is the most popular lightweight modding toolchain for modern Minecraft.',
        body: `# How to install {{projectName}} with Fabric on Minecraft {{gameVersion}}

1. **Download Fabric Loader** for Minecraft {{gameVersion}} from [fabricmc.net](https://fabricmc.net).
2. Run the installer and pick the **client profile** (or **server profile** if you're running {{server}}).
3. Open your Minecraft directory:
   - Windows: press \`Win + R\`, type \`%appdata%\\.minecraft\`
   - macOS: \`~/Library/Application Support/minecraft\`
4. Place the {{projectName}} \`.jar\` (filename: \`{{filename}}\`) into the \`mods\` folder.
5. Launch the Fabric profile from the Minecraft launcher.

## Verifying
Start the game. If Fabric is installed correctly you'll see the Fabric mod list screen before reaching the title.

{{client}}Ready to play? Open Minecraft with the Fabric profile and enjoy {{projectName}} v{{version}}!
`,
        recommended: true,
      },
      {
        loader: 'FORGE',
        title: 'Install with Forge',
        excerpt:
          'Forge is the original Minecraft modding platform with the largest legacy mod ecosystem.',
        body: `# How to install {{projectName}} with Forge on Minecraft {{gameVersion}}

1. **Download the Forge installer** for Minecraft {{gameVersion}} from [files.minecraftforge.net](https://files.minecraftforge.net/).
2. Run the installer and choose **Install client** (or **Install server** for {{server}}).
3. Open your Minecraft directory:
   - Windows: \`%appdata%\\.minecraft\`
   - macOS: \`~/Library/Application Support/minecraft\`
4. Place \`{{filename}}\` into the \`mods\` folder.
5. In the Minecraft launcher select the \`forge\` profile.

## Verifying
The Minecraft main menu should now show a \`Mods\` button. Click it to confirm {{projectName}} v{{version}} is loaded.

{{client}}Need help? Forge's official wiki covers [common install issues](https://docs.minecraftforge.net/).
`,
        recommended: true,
      },
      {
        loader: 'NEOFORGE',
        title: 'Install with NeoForge',
        excerpt: 'NeoForge is the modern Forge fork for newer Minecraft versions.',
        body: `# How to install {{projectName}} with NeoForge on Minecraft {{gameVersion}}

1. **Download the NeoForge installer** for {{gameVersion}} from [neoforged.net](https://neoforged.net/).
2. Run the installer; it will place the \`neoforge\` profile into your launcher.
3. Open the \`mods\` folder inside your Minecraft directory.
4. Drop \`{{filename}}\` (currently v{{version}}) into \`mods/\`.
5. Launch the \`neoforge\` profile from the launcher.

## Troubleshooting
If Minecraft crashes on startup, open the latest log under \`logs/latest.log\` and check for a missing dependency.

{{client}}NeoForge is API-compatible with most Forge mods, so {{projectName}} should run alongside any Forge mods you already have.
`,
        recommended: false,
      },
    ];
    let created = 0;
    for (const d of defaults) {
      const existing = await this.prisma.installGuideTemplate.findFirst({
        where: { loader: d.loader, title: d.title },
      });
      if (!existing) {
        await this.prisma.installGuideTemplate.create({ data: d });
        created++;
      }
    }
    return created;
  }

  /**
   * Render the best install guide template for a given project based on the
   * project's primary loader. Performs simple `{{token}}` substitution.
   */
  async renderForProject(projectId: string): Promise<{
    templateId: string;
    loader: string;
    title: string;
    excerpt: string | null;
    body: string;
  } | null> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        loaders: { orderBy: { id: 'asc' }, take: 1 },
      },
    });
    if (!project) return null;

    const loaders = project.loaders.map((l: any) => String(l.type).toUpperCase());
    const primaryLoader = loaders[0] ?? null;
    const gameVersion = project.loaders[0]?.versionString ?? null;

    // First, try a project-loader match (preferred). Fall back to any
    // "recommended" template. Finally pick the first row by loader name.
    const candidates = await this.prisma.installGuideTemplate.findMany({
      where: primaryLoader ? { loader: primaryLoader } : undefined,
      orderBy: [{ recommended: 'desc' }, { createdAt: 'asc' }],
    });
    const template = candidates[0];

    if (!template) {
      // Last-ditch: recommended template regardless of loader.
      const fallback = await this.prisma.installGuideTemplate.findFirst({
        where: { recommended: true },
        orderBy: { createdAt: 'asc' },
      });
      if (!fallback) return null;
      return this.applyTemplate(
        fallback,
        project,
        primaryLoader,
        gameVersion,
        formatLoaderVersion(primaryLoader, project.loaders),
      );
    }

    const loaderVersion = formatLoaderVersion(primaryLoader, project.loaders);
    return this.applyTemplate(template, project, primaryLoader, gameVersion, loaderVersion);
  }

  private applyTemplate(
    template: any,
    project: any,
    primaryLoader: string | null,
    gameVersion: string | null,
    loaderVersion: string | null,
  ) {
    const filename = `${project.slug || 'mod'}.jar`;
    const version = project.latestVersion ?? 'latest';
    const client =
      project.clientSide === false
        ? ''
        : '**Tip:** on a multiplayer server every player needs the same version of this mod.\n\n';
    const server =
      project.serverSide === false
        ? 'Note: this is a client-only mod.\n'
        : 'Note: install the same jar in the server\u2019s `mods` folder too.\n';
    const replaced = template.body.replace(PLACEHOLDER_RE, (_m: string, key: string) => {
      switch (key) {
        case 'projectName':
          return project.title ?? 'this mod';
        case 'loader':
          return primaryLoader ?? 'your loader';
        case 'loaderVersion':
          return loaderVersion ?? 'latest';
        case 'gameVersion':
          return gameVersion ?? 'your Minecraft version';
        case 'client':
          return client;
        case 'server':
          return server;
        case 'filename':
          return filename;
        case 'version':
          return version;
        default:
          return '';
      }
    });
    return {
      templateId: template.id,
      loader: template.loader,
      title: template.title.replace(/\{\{\s*projectName\s*\}\}/g, project.title ?? 'this mod'),
      excerpt: template.excerpt,
      body: replaced,
    };
  }
}
