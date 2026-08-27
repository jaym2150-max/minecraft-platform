import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ProjectStatus } from '@prisma/client';

export interface SemanticParse {
  loaders: string[];
  gameVersions: string[];
  categories: string[];
  tags: string[];
  search: string;
}

const LOADER_KEYWORDS: Record<string, string> = {
  fabric: 'FABRIC',
  forge: 'FORGE',
  neoforge: 'NEOFORGE',
  quilt: 'QUILT',
  bukkit: 'BUKKIT',
  spigot: 'SPIGOT',
  paper: 'PAPER',
};

const CATEGORY_KEYWORDS: Record<string, string> = {
  technology: 'technology',
  tech: 'technology',
  magic: 'magic',
  adventure: 'adventure',
  exploration: 'adventure',
  optimization: 'optimization',
  storage: 'storage',
  worldgen: 'worldgen',
  utility: 'utility',
  decoration: 'decoration',
  gameplay: 'gameplay',
  redstone: 'redstone',
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  constructor(private readonly prisma: PrismaService) {}

  parseNaturalLanguage(query: string): SemanticParse {
    const q = query.toLowerCase();
    const loaders: string[] = [];
    for (const [kw, type] of Object.entries(LOADER_KEYWORDS)) {
      if (q.includes(kw)) loaders.push(type);
    }
    const gameVersions = Array.from(
      new Set((q.match(/\d+\.\d+(?:\.\d+)?/g) ?? []).map((v) => v.trim())),
    );
    const categories: string[] = [];
    const tags: string[] = [];
    for (const [kw, slug] of Object.entries(CATEGORY_KEYWORDS)) {
      if (q.includes(kw)) {
        categories.push(slug);
        tags.push(slug);
      }
    }
    // remove matched keywords to derive pure search
    let search = query;
    for (const kw of Object.keys({ ...LOADER_KEYWORDS, ...CATEGORY_KEYWORDS })) {
      search = search.replace(new RegExp(`\\b${kw}\\b`, 'gi'), ' ');
    }
    search = search
      .replace(/\d+\.\d+(?:\.\d+)?/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    // strip common filler
    search = search
      .replace(/\b(i want|mods|for|that|dont|don't|require|without|with|and|the|a|an)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return {
      loaders: Array.from(new Set(loaders)),
      gameVersions,
      categories: Array.from(new Set(categories)),
      tags: Array.from(new Set(tags)),
      search,
    };
  }

  async semanticSearch(
    query: string,
    limit = 12,
  ): Promise<{ parsed: SemanticParse; results: any[]; explanation: string }> {
    const parsed = this.parseNaturalLanguage(query);
    const where: any = { status: ProjectStatus.PUBLISHED };
    if (parsed.categories.length) {
      where.category = { slug: { in: parsed.categories } };
    }
    // tag filtering via relation would need project.tags; use category as proxy for v1
    if (parsed.search) {
      where.OR = [
        { title: { contains: parsed.search, mode: 'insensitive' } },
        { description: { contains: parsed.search, mode: 'insensitive' } },
      ];
    }
    // loader + gameVersion filtering via Loader rows
    let loaderFilter: any = undefined;
    if (parsed.loaders.length || parsed.gameVersions.length) {
      loaderFilter = {};
      if (parsed.loaders.length) loaderFilter.type = { in: parsed.loaders };
      if (parsed.gameVersions.length) loaderFilter.versionString = { in: parsed.gameVersions };
    }

    const projects = await this.prisma.project.findMany({
      where: {
        ...where,
        ...(loaderFilter ? { loaders: { some: loaderFilter } } : {}),
      },
      include: {
        category: { select: { name: true, slug: true } },
        loaders: { select: { type: true, versionString: true } },
      },
      take: limit,
      orderBy: [{ downloads: 'desc' }],
    });

    const parts: string[] = [];
    if (parsed.loaders.length) parts.push(`loader ${parsed.loaders.join(', ')}`);
    if (parsed.gameVersions.length) parts.push(`Minecraft ${parsed.gameVersions.join(', ')}`);
    if (parsed.categories.length) parts.push(`category ${parsed.categories.join(', ')}`);
    if (parsed.search) parts.push(`keywords "${parsed.search}"`);
    const explanation = parts.length
      ? `Found ${projects.length} mods matching ${parts.join(' + ')}.`
      : `No strong filters detected — showing popular mods.`;

    return { parsed, results: projects, explanation };
  }

  async recommendForModpack(
    prompt: string,
    limit = 8,
  ): Promise<{ parsed: SemanticParse; results: any[]; explanation: string }> {
    // Reuse semantic parsing but bias toward modpack-compatible mods
    const res = await this.semanticSearch(prompt, limit);
    const explanation = `Modpack suggestions: ${res.explanation} These pair well together based on loader and category overlap.`;
    return { ...res, explanation };
  }

  async summarizeMod(
    slugOrId: string,
  ): Promise<{ slug: string; title: string; summary: string; bullets: string[] } | null> {
    const project = await this.prisma.project.findFirst({
      where: { OR: [{ id: slugOrId }, { slug: slugOrId }] },
      include: { category: { select: { name: true } } },
    });
    if (!project) return null;
    const desc = (project.description ?? '').slice(0, 300);
    const bullets = [
      `Category: ${project.category?.name ?? 'mod'}`,
      `Downloads: ${project.downloads}`,
      project.clientSide && project.serverSide
        ? 'Works on client and server'
        : project.clientSide
          ? 'Client-side'
          : 'Server-side',
    ].filter(Boolean) as string[];
    const summary = desc
      ? `${desc.slice(0, 180)}...`
      : `A ${project.category?.name ?? 'mod'} for Minecraft.`;
    return { slug: project.slug, title: project.title, summary, bullets };
  }

  async explainCompatibility(
    slugOrId: string,
    gameVersion?: string,
    loader?: string,
  ): Promise<{ slug: string; title: string; compatible: boolean; reasons: string[] } | null> {
    const project = await this.prisma.project.findFirst({
      where: { OR: [{ id: slugOrId }, { slug: slugOrId }] },
      include: { loaders: true },
    });
    if (!project) return null;
    const reasons: string[] = [];
    let compatible = true;
    if (gameVersion) {
      const hasVersion = project.loaders.some((l: any) => l.versionString === gameVersion);
      if (!hasVersion) {
        compatible = false;
        reasons.push(`No loader row declares Minecraft ${gameVersion}.`);
      } else {
        reasons.push(`Declares support for Minecraft ${gameVersion}.`);
      }
    }
    if (loader) {
      const hasLoader = project.loaders.some(
        (l: any) => String(l.type).toUpperCase() === loader.toUpperCase(),
      );
      if (!hasLoader) {
        compatible = false;
        reasons.push(`No loader row for ${loader}.`);
      } else {
        reasons.push(`Supports loader ${loader}.`);
      }
    }
    if (reasons.length === 0) reasons.push('No specific compatibility filters applied.');
    return { slug: project.slug, title: project.title, compatible, reasons };
  }

  async troubleshooting(prompt: string): Promise<{ answer: string; steps: string[] }> {
    const lower = prompt.toLowerCase();
    const steps: string[] = [];
    let answer = 'Try these steps:';
    if (lower.includes('crash') || lower.includes('crash')) {
      steps.push('Check the latest.log under logs/latest.log for the first error.');
      steps.push('Remove half your mods and re-test to isolate the conflict.');
      steps.push('Verify every mod supports your exact Minecraft version and loader.');
    } else if (lower.includes('incompatible') || lower.includes('dependency')) {
      steps.push('Open the Dependencies tab to see missing or incompatible mods.');
      steps.push('Install the required dependency version shown on the mod page.');
    } else {
      steps.push(
        'Ensure the mod loader (Fabric/Forge/NeoForge) is installed for your Minecraft version.',
      );
      steps.push('Place the .jar in the mods/ folder and restart the launcher.');
      steps.push('If it still fails, check logs/latest.log for the first error.');
    }
    answer = steps.join(' ');
    return { answer, steps };
  }
}
