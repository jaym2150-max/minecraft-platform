import { PrismaClient, UserRole, ProjectStatus, VersionStatus, ScanStatus, LoaderType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { USERS, CATEGORIES, MINECRAFT_VERSIONS, PROJECTS, COLLECTIONS } from './seed-data';

const prisma = new PrismaClient();

function rng(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let s = h >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const between = (r: () => number, min: number, max: number) => Math.floor(r() * (max - min + 1)) + min;

const COMMENTS = [
  'Amazing mod! Really improved my experience.',
  'Works great with my setup, thanks for maintaining this!',
  'Been using this for years. Absolute essential.',
  'This is what modding is all about. Well done!',
  'Performance went through the roof after installing.',
];

const REVIEWS = [
  { rating: 5, title: 'Excellent!', body: 'Exactly what I was looking for. Works flawlessly on the latest version.' },
  { rating: 4, title: 'Very good', body: 'Great overall. A bit tricky to configure at first, but worth the effort.' },
  { rating: 5, title: 'Must have', body: 'Essential for any playthrough. The developer is responsive and updates come quickly.' },
  { rating: 4, title: 'Solid choice', body: 'Does what it promises. Would love a few more config options in future releases.' },
  { rating: 3, title: 'Decent', body: 'Works fine but I ran into minor compatibility issues with another mod.' },
];

function buildBody(p: typeof PROJECTS[number]): string {
  const gv = p.gameVersions.join(', ');
  const faq = [
    ['Is this free?', 'Yes - it is completely free to download and use.'],
    ['Which versions are supported?', `${gv}. Older releases remain available under Versions.`],
    ['How do I report a bug?', 'Leave a comment or open an issue on the source tracker.'],
  ];
  return [
    `# ${p.title}`,
    '',
    `${p.description} ${p.features[0]}.`,
    '',
    '## Features',
    '',
    ...p.features.map((f) => `- **${f.split(' ').slice(0, 3).join(' ')}** — ${f}`),
    '',
    '## Getting Started',
    '',
    '1. Install a compatible loader',
    `2. Download the latest file for **${p.gameVersions[0]}**`,
    '3. Drop it into your mods folder',
    '4. Launch the game and enjoy!',
    '',
    '## FAQ',
    '',
    faq.map(([q, a]) => `**${q}**\n\n${a}`).join('\n\n'),
  ].join('\n');
}

async function main() {
  console.log('🌱 Starting database seed...');

  console.log('  → Cleaning existing data');
  await prisma.download.deleteMany();
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.galleryImage.deleteMany();
  await prisma.dependency.deleteMany();
  await prisma.loader.deleteMany();
  await prisma.projectVersion.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.collectionProject.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.project.deleteMany();
  await prisma.license.deleteMany();
  await prisma.category.deleteMany();
  await prisma.minecraftVersion.deleteMany();
  // Wipe users + their financial rows (dev database only)
  await prisma.earningLedger.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.payoutAccount.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log('  → Seeding categories & MC versions');
  for (const c of CATEGORIES) await prisma.category.create({ data: c });
  for (const v of MINECRAFT_VERSIONS) await prisma.minecraftVersion.create({ data: v });

  console.log('  → Seeding users');
  const passwordHash = await bcrypt.hash('password123', 10);
  for (const u of USERS) {
    await prisma.user.create({ data: { ...(u as any), passwordHash, emailVerified: true } });
  }

  console.log(`  → Seeding ${PROJECTS.length} projects`);
  const licenses = await prisma.license.findMany();

  for (const p of PROJECTS) {
    const r = rng(p.slug);
    const author = await prisma.user.findUnique({ where: { username: p.authorUsername } });
    const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
    if (!author || !category) {
      console.warn(`    ⚠ skip ${p.slug} (missing author/category)`);
      continue;
    }
    const lic = licenses.find((l) => l.shortId === p.licenseShortId);

    const initials = p.title.replace(/[^a-zA-Z ]/g, '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const created = await prisma.project.create({
      data: {
        title: p.title,
        slug: p.slug,
        description: p.description,
        body: buildBody(p),
        iconUrl: `https://placehold.co/128x128/${encodeURIComponent(p.color)}/ffffff?text=${initials}`,
        coverUrl: `https://placehold.co/1200x300/${encodeURIComponent(p.color)}/ffffff?text=${encodeURIComponent(p.title)}`,
        sourceUrl: p.sourceUrl ? `https://github.com/example/${p.slug}` : undefined,
        wikiUrl: p.wikiUrl ? `https://wiki.example.com/${p.slug}` : undefined,
        discordUrl: p.discordUrl ? 'https://discord.gg/minecraftplatform' : undefined,
        downloads: p.downloads,
        views: p.views,
        status: ProjectStatus.PUBLISHED,
        featured: p.featured ?? false,
        authorId: author.id,
        categoryId: category.id,
        licenseId: lic?.id ?? null,
        clientSide: true,
        serverSide: p.type !== 'PLUGIN',
        projectType: p.type,
      },
    });

    // Versions
    const vers = p.versions ?? [{ version: '1.0.0', changelog: 'Initial release.', weight: 1 }];
    let primaryVersionId: string | null = null;
    for (let vi = 0; vi < vers.length; vi++) {
      const v = vers[vi];
      const pv = await prisma.projectVersion.create({
        data: {
          version: v.version,
          changelog: v.changelog,
          fileUrl: `https://cdn.example.com/files/${p.slug}-${v.version}.jar`,
          filename: `${p.slug}-${v.version}.jar`,
          fileSize: between(r, 150, 900) * 1024,
          hash: `sha256:${vi}${String(vi % 10).repeat(63)}`,
          downloads: Math.floor(p.downloads * v.weight),
          status: VersionStatus.APPROVED,
          scanStatus: ScanStatus.CLEAN,
          projectId: created.id,
        },
      });
      if (vi === 0) primaryVersionId = pv.id;
      for (const lt of p.loaders) {
        await prisma.loader.create({
          data: { type: lt as LoaderType, versionString: `0.${between(r, 14, 16)}.0`, projectId: created.id, versionId: pv.id },
        });
      }
    }

    // Dependencies
    for (const depSlug of p.requires ?? []) {
      const dep = await prisma.project.findUnique({ where: { slug: depSlug } });
      if (dep && primaryVersionId) {
        await prisma.dependency.create({
          data: { dependentId: created.id, requiredId: dep.id, versionId: primaryVersionId, isRequired: true },
        }).catch(() => {});
      }
    }

    // Team
    const team = await prisma.team.create({
      data: { name: `${p.title} Team`, description: `Official team for ${p.title}.`, projectId: created.id },
    });
    await prisma.teamMember.create({
      data: { role: 'OWNER' as any, userId: author.id, teamId: team.id, projectId: created.id },
    });
    const others = USERS.filter((u) => u.username !== p.authorUsername);
    const contribUser = await prisma.user.findUnique({ where: { username: others[Math.floor(r() * others.length)].username } });
    if (contribUser) {
      await prisma.teamMember.create({
        data: { role: 'CONTRIBUTOR' as any, userId: contribUser.id, teamId: team.id, projectId: created.id },
      }).catch(() => {});
    }

    // Gallery
    for (let gi = 1; gi <= 3; gi++) {
      await prisma.galleryImage.create({
        data: {
          type: 'IMAGE' as any,
          url: `https://placehold.co/800x450/${encodeURIComponent(p.color)}/ffffff?text=${encodeURIComponent(p.title)}+${gi}`,
          thumbnailUrl: `https://placehold.co/400x225/${encodeURIComponent(p.color)}/ffffff?text=${gi}`,
          alt: `${p.title} screenshot ${gi}`,
          width: 800, height: 450, order: gi,
          projectId: created.id,
        },
      });
    }

    // Comments
    const commenters = USERS.filter((u) => u.username !== p.authorUsername);
    for (let ci = 0; ci < 2 + Math.floor(r() * 2); ci++) {
      const cu = await prisma.user.findUnique({
        where: { username: commenters[(ci * 7 + p.slug.length) % commenters.length].username },
      });
      if (cu) {
        await prisma.comment.create({
          data: { content: COMMENTS[(p.slug.length + ci) % COMMENTS.length], authorId: cu.id, projectId: created.id },
        });
      }
    }

    // Reviews + aggregate
    const reviewers = USERS.filter((u) => u.username !== p.authorUsername);
    const reviewCount = between(r, 3, 5);
    let ratingSum = 0;
    for (let ri = 0; ri < reviewCount; ri++) {
      const ru = await prisma.user.findUnique({
        where: { username: reviewers[(ri * 5 + p.slug.length) % reviewers.length].username },
      });
      if (!ru) continue;
      const rd = REVIEWS[ri % REVIEWS.length];
      ratingSum += rd.rating;
      await prisma.review.create({
        data: { rating: rd.rating, title: rd.title, body: rd.body, userId: ru.id, projectId: created.id },
      }).catch(() => {});
    }
    if (ratingSum > 0) {
      await prisma.project.update({
        where: { id: created.id },
        data: { ratingAverage: +(ratingSum / reviewCount).toFixed(2), ratingCount: reviewCount },
      }).catch(() => {});
    }
  }

  // Collections
  console.log('  → Seeding collections');
  const admin = await prisma.user.findUnique({ where: { email: 'admin@minecraftplatform.com' } });
  if (admin) {
    for (const c of COLLECTIONS) {
      const projects = await prisma.project.findMany({ where: { slug: { in: c.slugs } } });
      if (projects.length === 0) continue;
      await prisma.collection.create({
        data: {
          name: c.name, description: c.description, iconUrl: c.iconUrl,
          isPublic: true, userId: admin.id,
          projects: { create: projects.map((proj, i) => ({ projectId: proj.id, sortOrder: i })) },
        },
      });
    }
  }

  // Subscription plans
  const planCount = await prisma.subscriptionPlan.count();
  if (planCount === 0) {
    await prisma.subscriptionPlan.createMany({
      data: [
        { name: 'Free', slug: 'free', tier: 'FREE' as any, price: 0, interval: 'month', description: 'Basic features', features: [], popular: false },
        { name: 'Creator', slug: 'creator_monthly', tier: 'CREATOR' as any, price: 499, interval: 'month', description: 'For active creators', features: [], popular: true },
      ] as any,
    });
  }

  console.log('✅ Seed complete!');
  const counts = {
    projects: await prisma.project.count(),
    versions: await prisma.projectVersion.count(),
    reviews: await prisma.review.count(),
    comments: await prisma.comment.count(),
    collections: await prisma.collection.count(),
  };
  console.log(`   ${JSON.stringify(counts)}`);
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
