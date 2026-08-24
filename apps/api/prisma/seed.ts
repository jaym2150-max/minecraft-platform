import { PrismaClient, UserRole, ProjectStatus, VersionStatus, LoaderType, LicenseType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Adventure', slug: 'adventure', icon: '🗺️', color: '#10b981', order: 1 },
  { name: 'Performance', slug: 'performance', icon: '⚡', color: '#f59e0b', order: 2 },
  { name: 'Technology', slug: 'technology', icon: '⚙️', color: '#3b82f6', order: 3 },
  { name: 'Utility', slug: 'utility', icon: '🔧', color: '#8b5cf6', order: 4 },
  { name: 'Magic', slug: 'magic', icon: '✨', color: '#ec4899', order: 5 },
  { name: 'Library', slug: 'library', icon: '📚', color: '#06b6d4', order: 6 },
  { name: 'World Gen', slug: 'worldgen', icon: '🌍', color: '#22c55e', order: 7 },
  { name: 'Food', slug: 'food', icon: '🍞', color: '#f97316', order: 8 },
  { name: 'Mobs', slug: 'mobs', icon: '🐺', color: '#ef4444', order: 9 },
  { name: 'Equipment', slug: 'equipment', icon: '⚔️', color: '#a3a3a3', order: 10 },
  { name: 'Decoration', slug: 'decoration', icon: '🏠', color: '#facc15', order: 11 },
  { name: 'Cursed', slug: 'cursed', icon: '😈', color: '#7c3aed', order: 12 },
];

const MINECRAFT_VERSIONS = [
  { version: '1.21.4', type: 'release', stable: true },
  { version: '1.21.3', type: 'release', stable: true },
  { version: '1.21.1', type: 'release', stable: true },
  { version: '1.21', type: 'release', stable: true },
  { version: '1.20.6', type: 'release', stable: true },
  { version: '1.20.4', type: 'release', stable: true },
  { version: '1.20.1', type: 'release', stable: true },
  { version: '1.20', type: 'release', stable: true },
  { version: '1.19.4', type: 'release', stable: true },
  { version: '1.19.2', type: 'release', stable: true },
  { version: '1.18.2', type: 'release', stable: true },
  { version: '1.17.1', type: 'release', stable: true },
  { version: '1.16.5', type: 'release', stable: true },
  { version: '1.12.2', type: 'release', stable: true },
  { version: '1.7.10', type: 'release', stable: true },
];

const USERS = [
  {
    username: 'admin',
    displayName: 'Platform Admin',
    email: 'admin@minecraftplatform.com',
    role: UserRole.OWNER,
    bio: 'Official administrator account for the platform.',
  },
  {
    username: 'demo_admin',
    displayName: 'Demo Admin',
    email: 'demo@admin.com',
    role: UserRole.ADMIN,
    bio: 'Demo admin account for testing.',
  },
  {
    username: 'demo_user',
    displayName: 'Demo User',
    email: 'demo@user.com',
    role: UserRole.USER,
    bio: 'Demo user account for testing.',
  },
  {
    username: 'caffeinemc',
    displayName: 'CaffeineMC',
    email: 'team@caffeinemc.net',
    role: UserRole.USER,
    bio: 'Performance optimization team behind Sodium and Lithium.',
  },
  {
    username: 'mezz',
    displayName: 'mezz',
    email: 'mezz@jei.example',
    role: UserRole.USER,
    bio: 'Author of JEI - Just Enough Items.',
  },
  {
    username: 'simibubi',
    displayName: 'Simibubi',
    email: 'simi@create.example',
    role: UserRole.USER,
    bio: 'Creator of the Create mod and several addon mods.',
  },
  {
    username: 'irisshaders',
    displayName: 'Iris Shaders',
    email: 'team@irisshaders.dev',
    role: UserRole.USER,
    bio: 'Mod loader for OpenGL shaders compatible with OptiFine.',
  },
];

const SAMPLE_PROJECTS = [
  {
    title: 'Sodium',
    slug: 'sodium',
    description: 'A modern, high-performance rendering engine and mod loader for Minecraft.',
    body: 'Sodium is a powerful rendering engine mod for Minecraft that significantly improves FPS and reduces stutter. It works as a Fabric mod and integrates with most other performance mods.',
    downloads: 12500000,
    views: 45000000,
    status: ProjectStatus.PUBLISHED,
    featured: true,
    authorUsername: 'caffeinemc',
    categorySlug: 'performance',
    iconUrl: 'https://placehold.co/128x128/10b981/ffffff?text=S',
  },
  {
    title: 'Just Enough Items (JEI)',
    slug: 'jei',
    description: 'View items and recipes in a clean, searchable interface.',
    body: 'JEI is a物品和配方查看器 for Minecraft. It provides an easy way to view items, blocks, and recipes in-game.',
    downloads: 15100000,
    views: 62000000,
    status: ProjectStatus.PUBLISHED,
    featured: true,
    authorUsername: 'mezz',
    categorySlug: 'utility',
    iconUrl: 'https://placehold.co/128x128/8b5cf6/ffffff?text=J',
  },
  {
    title: 'Create',
    slug: 'create',
    description: 'Aesthetic technology mod focused on building contraptions.',
    body: 'Create is a mod that brings aesthetic technology and automation to Minecraft. Build moving structures, automate production, and create intricate mechanical systems.',
    downloads: 8200000,
    views: 28000000,
    status: ProjectStatus.PUBLISHED,
    featured: true,
    authorUsername: 'simibubi',
    categorySlug: 'technology',
    iconUrl: 'https://placehold.co/128x128/3b82f6/ffffff?text=C',
  },
  {
    title: 'Iris Shaders',
    slug: 'iris',
    description: 'A modern shader pack loader for Minecraft.',
    body: 'Iris is a powerful shader mod that brings beautiful visual effects to Minecraft. Compatible with OptiFine shader packs.',
    downloads: 6800000,
    views: 22000000,
    status: ProjectStatus.PUBLISHED,
    featured: false,
    authorUsername: 'irisshaders',
    categorySlug: 'decoration',
    iconUrl: 'https://placehold.co/128x128/facc15/000000?text=I',
  },
];

const LICENSES = [
  { shortId: 'MIT', name: 'MIT License', type: LicenseType.PERMISSIVE, url: 'https://opensource.org/licenses/MIT', description: 'Permissive license, allows commercial use, modification, distribution.', featured: true },
  { shortId: 'Apache-2.0', name: 'Apache License 2.0', type: LicenseType.PERMISSIVE, url: 'https://www.apache.org/licenses/LICENSE-2.0', description: 'Permissive license with patent grant and explicit attribution.', featured: true },
  { shortId: 'GPL-3.0', name: 'GNU General Public License v3.0', type: LicenseType.COPYLEFT, url: 'https://www.gnu.org/licenses/gpl-3.0.txt', description: 'Strong copyleft: derivatives must be distributed under GPL-3.0.', featured: true },
  { shortId: 'LGPL-3.0', name: 'GNU Lesser General Public License v3.0', type: LicenseType.COPYLEFT, url: 'https://www.gnu.org/licenses/lgpl-3.0.txt', description: 'Weak copyleft: allows linking from proprietary code.', featured: true },
  { shortId: 'MPL-2.0', name: 'Mozilla Public License 2.0', type: LicenseType.COPYLEFT, url: 'https://www.mozilla.org/en-US/MPL/2.0/', description: 'File-level copyleft: modifications to MPL files must be shared.', featured: true },
  { shortId: 'BSD-3-Clause', name: 'BSD 3-Clause "New" or "Revised" License', type: LicenseType.PERMISSIVE, url: 'https://opensource.org/licenses/BSD-3-Clause', description: 'Permissive license with non-endorsement clause.', featured: true },
  { shortId: 'BSD-2-Clause', name: 'BSD 2-Clause "Simplified" or "FreeBSD" License', type: LicenseType.PERMISSIVE, url: 'https://opensource.org/licenses/BSD-2-Clause', description: 'Permissive license without non-endorsement clause.', featured: true },
  { shortId: 'ISC', name: 'ISC License', type: LicenseType.PERMISSIVE, url: 'https://opensource.org/licenses/ISC', description: 'Functionally equivalent to BSD-2-Clause.', featured: true },
  { shortId: 'CC0-1.0', name: 'Creative Commons Zero v1.0 Universal', type: LicenseType.PUBLIC_DOMAIN, url: 'https://creativecommons.org/publicdomain/zero/1.0/', description: 'Public domain dedication, no rights reserved.', featured: true },
  { shortId: 'CC-BY-4.0', name: 'Creative Commons Attribution 4.0 International', type: LicenseType.PERMISSIVE, url: 'https://creativecommons.org/licenses/by/4.0/', description: 'Attribution required, commercial use allowed.', featured: true },
  { shortId: 'CC-BY-SA-4.0', name: 'Creative Commons Attribution-ShareAlike 4.0', type: LicenseType.COPYLEFT, url: 'https://creativecommons.org/licenses/by-sa/4.0/', description: 'Attribution and share-alike required.', featured: true },
  { shortId: 'CC-BY-NC-4.0', name: 'Creative Commons Attribution-NonCommercial 4.0', type: LicenseType.PERMISSIVE, url: 'https://creativecommons.org/licenses/by-nc/4.0/', description: 'Attribution required, non-commercial use only.', featured: false },
  { shortId: 'Unlicense', name: 'The Unlicense', type: LicenseType.PUBLIC_DOMAIN, url: 'https://unlicense.org/', description: 'Public domain dedication, similar to CC0.', featured: true },
  { shortId: 'Zlib', name: 'zlib License', type: LicenseType.PERMISSIVE, url: 'https://opensource.org/licenses/Zlib', description: 'Permissive license, similar to BSD.', featured: false },
  { shortId: 'PolyForm-1.0.0', name: 'PolyForm Strict License 1.0.0', type: LicenseType.PROPRIETARY, url: 'https://polyformproject.org/licenses/strict/1.0.0', description: 'Use allowed, modifications and redistribution not allowed.', featured: false },
  { shortId: 'ARR', name: 'All Rights Reserved', type: LicenseType.PROPRIETARY, url: null, description: 'Proprietary license, all rights reserved by the copyright holder.', featured: false },
  { shortId: 'Custom', name: 'Custom License', type: LicenseType.UNKNOWN, url: null, description: 'Project-specific license terms. See project description for full text.', featured: false },
];

async function seedLicenses(): Promise<void> {
  for (const license of LICENSES) {
    await prisma.license.upsert({
      where: { shortId: license.shortId },
      update: {
        name: license.name,
        type: license.type,
        url: license.url,
        description: license.description,
        featured: license.featured,
      },
      create: {
        shortId: license.shortId,
        name: license.name,
        type: license.type,
        url: license.url,
        description: license.description,
        featured: license.featured,
      },
    });
  }
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
  await prisma.subscriptionPlan.deleteMany();
  await prisma.loader.deleteMany();
  await prisma.projectVersion.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.project.deleteMany();
  await prisma.license.deleteMany();
  await prisma.category.deleteMany();
  await prisma.minecraftVersion.deleteMany();
  await prisma.user.deleteMany();

  console.log('  → Seeding categories');
  for (const category of CATEGORIES) {
    await prisma.category.create({ data: category });
  }

  console.log('  → Seeding Minecraft versions');
  for (const version of MINECRAFT_VERSIONS) {
    await prisma.minecraftVersion.create({ data: version });
  }

  console.log('  → Seeding users');
  const passwordHash = await bcrypt.hash('password123', 10);
  for (const user of USERS) {
    await prisma.user.create({
      data: {
        ...user,
        passwordHash,
        emailVerified: true,
      },
    });
  }

  console.log('  → Seeding sample projects');
  const fabricLoaderId = `loader-${Date.now()}-fabric`;
  const mc121 = await prisma.minecraftVersion.findFirst({ where: { version: '1.21.1' } });
  const mc120 = await prisma.minecraftVersion.findFirst({ where: { version: '1.20.1' } });

  for (const project of SAMPLE_PROJECTS) {
    const author = await prisma.user.findUnique({ where: { username: project.authorUsername } });
    const category = await prisma.category.findUnique({ where: { slug: project.categorySlug } });
    if (!author || !category) continue;

    const created = await prisma.project.create({
      data: {
        title: project.title,
        slug: project.slug,
        description: project.description,
        body: project.body,
        downloads: project.downloads,
        views: project.views,
        status: project.status,
        featured: project.featured,
        authorId: author.id,
        categoryId: category.id,
        iconUrl: project.iconUrl,
        clientSide: true,
        serverSide: true,
      },
    });

    const version = await prisma.projectVersion.create({
      data: {
        version: '1.0.0',
        changelog: 'Initial release.',
        fileUrl: `https://cdn.example.com/files/${project.slug}-1.0.0.jar`,
        fileSize: 1024 * 250,
        hash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
        downloads: Math.floor(project.downloads * 0.6),
        status: VersionStatus.APPROVED,
        projectId: created.id,
      },
    });

    await prisma.loader.create({
      data: {
        type: LoaderType.FABRIC,
        versionString: '0.15.0',
        projectId: created.id,
        versionId: version.id,
      },
    });

    const team = await prisma.team.create({
      data: {
        name: `${project.title} Team`,
        description: `Official development team for ${project.title}.`,
        projectId: created.id,
      },
    });

    await prisma.teamMember.create({
      data: {
        role: 'OWNER' as any,
        userId: author.id,
        teamId: team.id,
        projectId: created.id,
      },
    });

    // Add a second team member for richer Team tab
    const otherUser = await prisma.user.findFirst({ where: { username: { not: project.authorUsername } } });
    if (otherUser) {
      await prisma.teamMember.create({
        data: {
          role: 'CONTRIBUTOR' as any,
          userId: otherUser.id,
          teamId: team.id,
          projectId: created.id,
        },
      }).catch(() => {});
    }

    // Gallery — 3 screenshots per project
    for (let i = 1; i <= 3; i++) {
      await prisma.galleryImage.create({
        data: {
          type: 'IMAGE' as any,
          url: `https://placehold.co/800x450/${['10b981','3b82f6','f59e0b'][i % 3]}/ffffff?text=${encodeURIComponent(project.title)}+${i}`,
          thumbnailUrl: `https://placehold.co/400x225/${['10b981','3b82f6','f59e0b'][i % 3]}/ffffff?text=${encodeURIComponent(project.title)}+${i}`,
          alt: `${project.title} screenshot ${i}`,
          width: 800,
          height: 450,
          order: i,
          projectId: created.id,
        },
      });
    }

    // Additional versions for Changelog/Versions tabs
    const extraVersions = [
      { version: '0.9.0', changelog: '### 0.9.0\n- Added Fabric 0.15.0 support\n- Fixed memory leak on world reload\n- Improved performance by 12%', downloads: Math.floor(project.downloads * 0.3) },
      { version: '0.8.5', changelog: '### 0.8.5\n- Initial beta release\n- Basic rendering pipeline\n- Known issue: shadows flicker on AMD', downloads: Math.floor(project.downloads * 0.15) },
    ];
    for (let idx = 0; idx < extraVersions.length; idx++) {
      const ev = extraVersions[idx];
      const loaderTypes = [LoaderType.FORGE, LoaderType.QUILT];
      const loaderType = loaderTypes[idx % loaderTypes.length];
      const v = await prisma.projectVersion.create({
        data: {
          version: ev.version,
          changelog: ev.changelog,
          fileUrl: `https://cdn.example.com/files/${project.slug}-${ev.version}.jar`,
          fileSize: 1024 * 200,
          hash: `sha256:${'1'.repeat(64)}`,
          downloads: ev.downloads,
          status: VersionStatus.APPROVED,
          projectId: created.id,
        },
      });
      await prisma.loader.create({
        data: {
          type: loaderType,
          versionString: '0.14.0',
          projectId: created.id,
          versionId: v.id,
        },
      });
    }

    // Dependencies — link to another project for demo
    const depTarget = await prisma.project.findFirst({ where: { id: { not: created.id } } });
    if (depTarget) {
      await prisma.dependency.create({
        data: {
          dependentId: created.id,
          requiredId: depTarget.id,
          versionId: version.id,
          isRequired: true,
        },
      }).catch(() => {});
    }

    // Comments — 2 per project
    const commentUsers = await prisma.user.findMany({ take: 2 });
    for (let i = 0; i < 2; i++) {
      const cu = commentUsers[i % commentUsers.length];
      await prisma.comment.create({
        data: {
          content: i === 0 ? 'Amazing mod! Really improved my FPS.' : 'Works great with my shader pack, thanks!',
          authorId: cu.id,
          projectId: created.id,
        },
      });
    }

    // Reviews — 3 per project with ratings
    const reviewUsers = await prisma.user.findMany({ take: 3 });
    const reviewData = [
      { rating: 5, title: 'Excellent!', body: 'Best performance mod out there. Highly recommended.' },
      { rating: 4, title: 'Very good', body: 'Great mod, a bit tricky to configure but worth it.' },
      { rating: 5, title: 'Must have', body: 'Essential for any modded playthrough.' },
    ];
    for (let i = 0; i < 3; i++) {
      const ru = reviewUsers[i % reviewUsers.length];
      const rd = reviewData[i];
      await prisma.review.create({
        data: {
          rating: rd.rating,
          title: rd.title,
          body: rd.body,
          userId: ru.id,
          projectId: created.id,
        },
      });
    }
  }

  console.log('  → Seeding featured collections');
  const allProjects = await prisma.project.findMany();
  const admin = await prisma.user.findUnique({ where: { email: 'admin@minecraftplatform.com' } });
  if (admin && allProjects.length > 0) {
    const byslug = (s: string) => allProjects.find((p) => p.slug === s)!;
    const FEATURED_COLLECTIONS = [
      {
        name: 'FPS Boost Pack',
        description: 'Squeeze every frame out of your game — the essential performance stack for any modded instance.',
        iconUrl: 'https://placehold.co/600x400/10b981/ffffff?text=FPS+BOOST',
        slugs: ['sodium', 'iris', 'jei'],
      },
      {
        name: 'Tech & Automation',
        description: 'Build factories, contraptions and fully automated production lines. Engineering inside Minecraft.',
        iconUrl: 'https://placehold.co/600x400/3b82f6/ffffff?text=TECH+%26+AUTO',
        slugs: ['create', 'jei'],
      },
      {
        name: 'Shader Ready',
        description: 'Beautiful visuals start here — shader loaders and the mods they play nicest with.',
        iconUrl: 'https://placehold.co/600x400/f59e0b/000000?text=SHADERS',
        slugs: ['iris', 'sodium'],
      },
    ];
    for (const fc of FEATURED_COLLECTIONS) {
      const projects = fc.slugs.map(byslug).filter(Boolean);
      if (projects.length === 0) continue;
      await prisma.collection.create({
        data: {
          name: fc.name,
          description: fc.description,
          iconUrl: fc.iconUrl,
          isPublic: true,
          userId: admin.id,
          projects: {
            create: projects.map((p) => ({ projectId: p.id })),
          },
        },
      });
    }
  }

  console.log('  → Seeding subscription plans');
  const plans = [
    { name: 'Free', slug: 'free', tier: 'FREE' as any, price: 0, interval: 'month', description: 'Get started with basic features', features: ['Upload up to 5 projects', 'Basic analytics', 'Community support'], popular: false },
    { name: 'Creator', slug: 'creator_monthly', tier: 'CREATOR' as any, price: 499, interval: 'month', description: 'For active mod creators', features: ['Unlimited projects', 'Advanced analytics', 'API key PRO tier', 'Priority support', 'Custom profile banner'], popular: true },
    { name: 'Creator Yearly', slug: 'creator_yearly', tier: 'CREATOR' as any, price: 4999, interval: 'year', description: 'Two months free', features: ['Everything in Creator Monthly', '2 months free', 'Early access features'], popular: false },
    { name: 'Pro', slug: 'pro_monthly', tier: 'PRO' as any, price: 1499, interval: 'month', description: 'For professional studios', features: ['Everything in Creator', 'Unlimited API keys', 'API key ENTERPRISE tier', 'Team management', 'Promoted project listings', 'Dedicated support'], popular: false },
    { name: 'Pro Yearly', slug: 'pro_yearly', tier: 'PRO' as any, price: 14999, interval: 'year', description: 'Best value for studios', features: ['Everything in Pro Monthly', '2 months free', 'White-label options'], popular: false },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.create({ data: plan });
  }

  console.log('  → Seeding licenses');
  await seedLicenses();

  console.log('✅ Seed complete!');
  console.log(`   • ${CATEGORIES.length} categories`);
  console.log(`   • ${MINECRAFT_VERSIONS.length} Minecraft versions`);
  console.log(`   • ${USERS.length} users`);
  console.log(`   • ${SAMPLE_PROJECTS.length} sample projects`);
  console.log(`   • ${LICENSES.length} licenses`);
  console.log('');
  console.log('📋 Demo Accounts:');
  console.log('   Admin: demo@admin.com / DemoAdmin1');
  console.log('   User:  demo@user.com / DemoUser1');
  console.log('   Owner: admin@minecraftplatform.com / password123');
  console.log('   (All seed users use password: "password123")');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
