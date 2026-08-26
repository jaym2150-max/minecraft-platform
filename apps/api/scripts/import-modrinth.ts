/**
 * Standalone Modrinth catalog importer.
 *
 *   pnpm --filter @mcp/api exec ts-node scripts/import-modrinth.ts [limitPerType]
 *
 * Pulls the most-downloaded projects of every type from the public Modrinth
 * v2 API with real versions, working download URLs, icons, gallery images
 * and licenses. Existing slugs are updated in place (idempotent).
 */

import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { htmlToMarkdown, looksLikeHtml } from '../src/modules/admin/html-to-markdown';

const API = 'https://api.modrinth.com/v2';
const UA = 'minecraft-platform/dev (+https://github.com/jaym2150-max/minecraft-platform)';

const LOADER_MAP: Record<string, string> = {
  fabric: 'FABRIC',
  forge: 'FORGE',
  neoforge: 'NEOFORGE',
  quilt: 'QUILT',
  bukkit: 'BUKKIT',
  spigot: 'SPIGOT',
  paper: 'PAPER',
  purpur: 'PURPUR',
};

const TYPE_PLAN = [
  { mrType: 'mod', take: 20 },
  { mrType: 'modpack', take: 12 },
  { mrType: 'shader', take: 8 },
  { mrType: 'plugin', take: 10 },
  { mrType: 'resourcepack', take: 6 },
  { mrType: 'datapack', take: 6 },
];

const prisma = new PrismaClient();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
});
const virusScanQueue = new Queue('virus-scan', { connection: redisConnection });

async function api<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API}${path}`, { headers: { 'User-Agent': UA } });
  if (!res.ok) {
    console.warn(`  ⚠ ${path} → ${res.status}`);
    return null;
  }
  return (await res.json()) as T;
}

function mapProjectType(t: string): string {
  const map: Record<string, string> = {
    modpack: 'MODPACK',
    resourcepack: 'RESOURCE_PACK',
    shader: 'SHADER',
    datapack: 'DATA_PACK',
    plugin: 'PLUGIN',
  };
  return map[t] ?? 'MOD';
}

async function importOne(hit: any): Promise<void> {
  const [full, versionsRes, galleryRes] = await Promise.all([
    api<any>(`/project/${hit.slug}`),
    api<any[]>(`/project/${hit.slug}/version`),
    api<any[]>(`/project/${hit.slug}/gallery`),
  ]);

  const authorUsername = hit.author || `${hit.slug}-team`;
  const author = await prisma.user.upsert({
    where: { username: authorUsername },
    update: {},
    create: {
      username: authorUsername,
      displayName: hit.author ?? authorUsername,
      email: `${authorUsername.toLowerCase()}@users.modrinth.imported`,
      passwordHash: '$2a$10$C6UzMDM.H6dfI/f/IKcEeO7ZBpEbF1nZ8O8O8O8O8O8O8O8O8O8O8',
      role: 'USER',
      emailVerified: false,
      bio: 'Imported Modrinth author.',
    },
  });

  let licenseId: string | null = null;
  const licShortId = (full?.license?.id ?? '').toUpperCase();
  if (licShortId && licShortId !== 'UNKNOWN') {
    const lic = await prisma.license
      .upsert({
        where: { shortId: licShortId },
        update: {},
        create: {
          shortId: licShortId,
          name: full?.license?.name ?? licShortId,
          type: 'UNKNOWN' as any,
          featured: false,
        },
      })
      .catch(() => null);
    licenseId = lic?.id ?? null;
  }

  let categoryId: string | null = null;
  for (const cSlug of full?.categories ?? []) {
    const cat = await prisma.category.findFirst({
      where: { OR: [{ slug: cSlug }, { name: { equals: cSlug, mode: 'insensitive' } }] },
    });
    if (cat) {
      categoryId = cat.id;
      break;
    }
  }

  const rawBody: string | null =
    typeof full?.body === 'string' && full.body.trim().length > 40 ? full.body : null;
  const bodyMd = rawBody ? (looksLikeHtml(rawBody) ? htmlToMarkdown(rawBody) : rawBody) : null;

  const project = await prisma.project.upsert({
    where: { slug: hit.slug },
    update: {
      title: hit.title,
      description: hit.description,
      body: bodyMd ?? undefined,
      iconUrl: hit.icon_url ?? undefined,
      coverUrl: galleryRes?.[0]?.url ?? undefined,
      sourceUrl: full?.source_url ?? undefined,
      discordUrl: full?.discord_url ?? undefined,
      downloads: hit.downloads,
      projectType: mapProjectType(full?.project_type ?? 'mod') as any,
      licenseId: licenseId ?? undefined,
      categoryId: categoryId ?? undefined,
    },
    create: {
      slug: hit.slug,
      title: hit.title,
      description: hit.description,
      body: bodyMd,
      iconUrl: hit.icon_url ?? null,
      coverUrl: galleryRes?.[0]?.url ?? null,
      sourceUrl: full?.source_url ?? null,
      discordUrl: full?.discord_url ?? null,
      wikiUrl: full?.issues_url ?? null,
      downloads: hit.downloads,
      status: 'PUBLISHED' as any,
      projectType: mapProjectType(full?.project_type ?? 'mod') as any,
      authorId: author.id,
      categoryId,
      licenseId,
      clientSide: hit.client_side !== 'unsupported',
      serverSide: hit.server_side !== 'unsupported',
    },
  });

  // Latest 3 versions with real files. Versions stay with the schema-default
  // scanStatus PENDING: downloads are gated on a genuine local ClamAV scan
  // (versions.service). We enqueue a real virus-scan job per version below
  // (the worker fetches the file from Modrinth's CDN and stamps CLEAN /
  // INFECTED). Never stamp CLEAN up front.
  const vs = (versionsRes ?? []).slice(0, 3);
  for (const v of vs) {
    const file = v.files.find((f: any) => f.primary) ?? v.files[0];
    if (!file) continue;
    const exists = await prisma.projectVersion.findUnique({
      where: {
        projectId_version: { projectId: project.id, version: v.version_number.slice(0, 100) },
      },
    });
    if (exists) continue;

    const pv = await prisma.projectVersion.create({
      data: {
        version: v.version_number.slice(0, 100),
        changelog: v.changelog ?? null,
        fileUrl: file.url,
        filename: file.filename,
        fileSize: file.size,
        hash: file.hashes?.sha512 ?? '',
        hashSha512: file.hashes?.sha512 ?? null,
        hashSha1: file.hashes?.sha1 ?? null,
        downloads: v.downloads,
        status: 'APPROVED' as any,
        projectId: project.id,
      },
    });

    await virusScanQueue
      .add(
        'scan-modrinth',
        {
          uploadId: `modrinth-import:${pv.id}`,
          projectId: project.id,
          projectVersionId: pv.id,
          filename: file.filename,
          size: file.size,
          fileUrl: file.url,
          remoteUrl: file.url,
          hash: file.hashes?.sha512 ?? undefined,
        },
        {
          attempts: 5,
          backoff: { type: 'exponential', delay: 10000 },
          removeOnComplete: { age: 86400 },
          removeOnFail: { age: 604800 },
        },
      )
      .catch((err: any) =>
        console.warn(
          `  ⚠ scan enqueue failed for ${hit.slug} ${v.version_number}: ${err?.message}`,
        ),
      );

    const loaders = v.loaders.map((l: string) => LOADER_MAP[l]).filter(Boolean);
    const gvs = v.game_versions.slice(0, 6);
    for (const l of loaders.length ? loaders : ['FABRIC']) {
      for (const gv of gvs) {
        await prisma.loader
          .create({
            data: { type: l as any, versionString: gv, projectId: project.id, versionId: pv.id },
          })
          .catch(() => {});
      }
    }
  }

  // Gallery up to 4
  const hasGallery = await prisma.galleryImage.count({ where: { projectId: project.id } });
  if (!hasGallery && galleryRes?.length) {
    for (let gi = 0; gi < Math.min(4, galleryRes.length); gi++) {
      const g = galleryRes[gi];
      await prisma.galleryImage
        .create({
          data: {
            type: 'IMAGE' as any,
            url: g.url,
            alt: g.title ?? `${hit.title} screenshot ${gi + 1}`,
            width: 800,
            height: 450,
            order: gi + 1,
            projectId: project.id,
          },
        })
        .catch(() => {});
    }
  }
}

async function main() {
  const limitPerType = Number(process.argv[2]) || undefined;
  console.log('📥 Importing popular projects from Modrinth...');
  const started = Date.now();
  const importedSlugs: string[] = [];

  for (const { mrType, take } of TYPE_PLAN) {
    const cap = limitPerType ? Math.min(take, limitPerType) : take;
    const facets = encodeURIComponent(JSON.stringify([[`project_type:${mrType}`]]));
    const search = await api<{ hits: any[] }>(
      `/search?limit=${cap}&index=downloads&facets=${facets}`,
    );
    if (!search?.hits?.length) continue;
    for (const hit of search.hits) {
      try {
        await importOne(hit);
        importedSlugs.push(hit.slug);
        process.stdout.write(`  ✓ ${mrType}: ${hit.title}\n`);
      } catch (err: any) {
        console.warn(`  ⚠ skip ${hit.slug}: ${err.message}`);
      }
      await sleep(120);
    }
  }

  // Feature top 8 overall by downloads
  const top = await prisma.project.findMany({
    where: { slug: { in: importedSlugs } },
    orderBy: { downloads: 'desc' },
    take: 8,
    select: { id: true },
  });
  for (const t of top) {
    await prisma.project.update({ where: { id: t.id }, data: { featured: true } });
  }

  console.log(
    `\n✅ Imported ${importedSlugs.length} projects in ${((Date.now() - started) / 1000).toFixed(0)}s`,
  );
  console.log(`   projects total: ${await prisma.project.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await virusScanQueue.close().catch(() => {});
    await redisConnection.quit().catch(() => {});
    await prisma.$disconnect();
  });
