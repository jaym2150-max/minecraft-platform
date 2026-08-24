"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcrypt = require("bcryptjs");
var prisma = new client_1.PrismaClient();
var CATEGORIES = [
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
var MINECRAFT_VERSIONS = [
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
var USERS = [
    {
        username: 'admin',
        displayName: 'Platform Admin',
        email: 'admin@minecraftplatform.com',
        role: client_1.UserRole.OWNER,
        bio: 'Official administrator account for the platform.',
    },
    {
        username: 'demo_admin',
        displayName: 'Demo Admin',
        email: 'demo@admin.com',
        role: client_1.UserRole.ADMIN,
        bio: 'Demo admin account for testing.',
    },
    {
        username: 'demo_user',
        displayName: 'Demo User',
        email: 'demo@user.com',
        role: client_1.UserRole.USER,
        bio: 'Demo user account for testing.',
    },
    {
        username: 'caffeinemc',
        displayName: 'CaffeineMC',
        email: 'team@caffeinemc.net',
        role: client_1.UserRole.USER,
        bio: 'Performance optimization team behind Sodium and Lithium.',
    },
    {
        username: 'mezz',
        displayName: 'mezz',
        email: 'mezz@jei.example',
        role: client_1.UserRole.USER,
        bio: 'Author of JEI - Just Enough Items.',
    },
    {
        username: 'simibubi',
        displayName: 'Simibubi',
        email: 'simi@create.example',
        role: client_1.UserRole.USER,
        bio: 'Creator of the Create mod and several addon mods.',
    },
    {
        username: 'irisshaders',
        displayName: 'Iris Shaders',
        email: 'team@irisshaders.dev',
        role: client_1.UserRole.USER,
        bio: 'Mod loader for OpenGL shaders compatible with OptiFine.',
    },
];
var SAMPLE_PROJECTS = [
    {
        title: 'Sodium',
        slug: 'sodium',
        description: 'A modern, high-performance rendering engine and mod loader for Minecraft.',
        body: 'Sodium is a powerful rendering engine mod for Minecraft that significantly improves FPS and reduces stutter. It works as a Fabric mod and integrates with most other performance mods.',
        downloads: 12500000,
        views: 45000000,
        status: client_1.ProjectStatus.PUBLISHED,
        featured: true,
        authorUsername: 'caffeinemc',
        categorySlug: 'performance',
        iconUrl: 'https://cdn.example.com/icons/sodium.png',
    },
    {
        title: 'Just Enough Items (JEI)',
        slug: 'jei',
        description: 'View items and recipes in a clean, searchable interface.',
        body: 'JEI is a物品和配方查看器 for Minecraft. It provides an easy way to view items, blocks, and recipes in-game.',
        downloads: 15100000,
        views: 62000000,
        status: client_1.ProjectStatus.PUBLISHED,
        featured: true,
        authorUsername: 'mezz',
        categorySlug: 'utility',
        iconUrl: 'https://cdn.example.com/icons/jei.png',
    },
    {
        title: 'Create',
        slug: 'create',
        description: 'Aesthetic technology mod focused on building contraptions.',
        body: 'Create is a mod that brings aesthetic technology and automation to Minecraft. Build moving structures, automate production, and create intricate mechanical systems.',
        downloads: 8200000,
        views: 28000000,
        status: client_1.ProjectStatus.PUBLISHED,
        featured: true,
        authorUsername: 'simibubi',
        categorySlug: 'technology',
        iconUrl: 'https://cdn.example.com/icons/create.png',
    },
    {
        title: 'Iris Shaders',
        slug: 'iris',
        description: 'A modern shader pack loader for Minecraft.',
        body: 'Iris is a powerful shader mod that brings beautiful visual effects to Minecraft. Compatible with OptiFine shader packs.',
        downloads: 6800000,
        views: 22000000,
        status: client_1.ProjectStatus.PUBLISHED,
        featured: false,
        authorUsername: 'irisshaders',
        categorySlug: 'decoration',
        iconUrl: 'https://cdn.example.com/icons/iris.png',
    },
];
var LICENSES = [
    { shortId: 'MIT', name: 'MIT License', type: client_1.LicenseType.PERMISSIVE, url: 'https://opensource.org/licenses/MIT', description: 'Permissive license, allows commercial use, modification, distribution.', featured: true },
    { shortId: 'Apache-2.0', name: 'Apache License 2.0', type: client_1.LicenseType.PERMISSIVE, url: 'https://www.apache.org/licenses/LICENSE-2.0', description: 'Permissive license with patent grant and explicit attribution.', featured: true },
    { shortId: 'GPL-3.0', name: 'GNU General Public License v3.0', type: client_1.LicenseType.COPYLEFT, url: 'https://www.gnu.org/licenses/gpl-3.0.txt', description: 'Strong copyleft: derivatives must be distributed under GPL-3.0.', featured: true },
    { shortId: 'LGPL-3.0', name: 'GNU Lesser General Public License v3.0', type: client_1.LicenseType.COPYLEFT, url: 'https://www.gnu.org/licenses/lgpl-3.0.txt', description: 'Weak copyleft: allows linking from proprietary code.', featured: true },
    { shortId: 'MPL-2.0', name: 'Mozilla Public License 2.0', type: client_1.LicenseType.COPYLEFT, url: 'https://www.mozilla.org/en-US/MPL/2.0/', description: 'File-level copyleft: modifications to MPL files must be shared.', featured: true },
    { shortId: 'BSD-3-Clause', name: 'BSD 3-Clause "New" or "Revised" License', type: client_1.LicenseType.PERMISSIVE, url: 'https://opensource.org/licenses/BSD-3-Clause', description: 'Permissive license with non-endorsement clause.', featured: true },
    { shortId: 'BSD-2-Clause', name: 'BSD 2-Clause "Simplified" or "FreeBSD" License', type: client_1.LicenseType.PERMISSIVE, url: 'https://opensource.org/licenses/BSD-2-Clause', description: 'Permissive license without non-endorsement clause.', featured: true },
    { shortId: 'ISC', name: 'ISC License', type: client_1.LicenseType.PERMISSIVE, url: 'https://opensource.org/licenses/ISC', description: 'Functionally equivalent to BSD-2-Clause.', featured: true },
    { shortId: 'CC0-1.0', name: 'Creative Commons Zero v1.0 Universal', type: client_1.LicenseType.PUBLIC_DOMAIN, url: 'https://creativecommons.org/publicdomain/zero/1.0/', description: 'Public domain dedication, no rights reserved.', featured: true },
    { shortId: 'CC-BY-4.0', name: 'Creative Commons Attribution 4.0 International', type: client_1.LicenseType.PERMISSIVE, url: 'https://creativecommons.org/licenses/by/4.0/', description: 'Attribution required, commercial use allowed.', featured: true },
    { shortId: 'CC-BY-SA-4.0', name: 'Creative Commons Attribution-ShareAlike 4.0', type: client_1.LicenseType.COPYLEFT, url: 'https://creativecommons.org/licenses/by-sa/4.0/', description: 'Attribution and share-alike required.', featured: true },
    { shortId: 'CC-BY-NC-4.0', name: 'Creative Commons Attribution-NonCommercial 4.0', type: client_1.LicenseType.PERMISSIVE, url: 'https://creativecommons.org/licenses/by-nc/4.0/', description: 'Attribution required, non-commercial use only.', featured: false },
    { shortId: 'Unlicense', name: 'The Unlicense', type: client_1.LicenseType.PUBLIC_DOMAIN, url: 'https://unlicense.org/', description: 'Public domain dedication, similar to CC0.', featured: true },
    { shortId: 'Zlib', name: 'zlib License', type: client_1.LicenseType.PERMISSIVE, url: 'https://opensource.org/licenses/Zlib', description: 'Permissive license, similar to BSD.', featured: false },
    { shortId: 'PolyForm-1.0.0', name: 'PolyForm Strict License 1.0.0', type: client_1.LicenseType.PROPRIETARY, url: 'https://polyformproject.org/licenses/strict/1.0.0', description: 'Use allowed, modifications and redistribution not allowed.', featured: false },
    { shortId: 'ARR', name: 'All Rights Reserved', type: client_1.LicenseType.PROPRIETARY, url: null, description: 'Proprietary license, all rights reserved by the copyright holder.', featured: false },
    { shortId: 'Custom', name: 'Custom License', type: client_1.LicenseType.UNKNOWN, url: null, description: 'Project-specific license terms. See project description for full text.', featured: false },
];
function seedLicenses() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, LICENSES_1, license;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, LICENSES_1 = LICENSES;
                    _a.label = 1;
                case 1:
                    if (!(_i < LICENSES_1.length)) return [3 /*break*/, 4];
                    license = LICENSES_1[_i];
                    return [4 /*yield*/, prisma.license.upsert({
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
                        })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, CATEGORIES_1, category, _a, MINECRAFT_VERSIONS_1, version, passwordHash, _b, USERS_1, user, fabricLoaderId, mc121, mc120, _c, SAMPLE_PROJECTS_1, project, author, category, created, version, team, plans, _d, plans_1, plan;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    console.log('🌱 Starting database seed...');
                    console.log('  → Cleaning existing data');
                    return [4 /*yield*/, prisma.download.deleteMany()];
                case 1:
                    _e.sent();
                    return [4 /*yield*/, prisma.report.deleteMany()];
                case 2:
                    _e.sent();
                    return [4 /*yield*/, prisma.notification.deleteMany()];
                case 3:
                    _e.sent();
                    return [4 /*yield*/, prisma.comment.deleteMany()];
                case 4:
                    _e.sent();
                    return [4 /*yield*/, prisma.dependency.deleteMany()];
                case 5:
                    _e.sent();
                    return [4 /*yield*/, prisma.loader.deleteMany()];
                case 6:
                    _e.sent();
                    return [4 /*yield*/, prisma.projectVersion.deleteMany()];
                case 7:
                    _e.sent();
                    return [4 /*yield*/, prisma.teamMember.deleteMany()];
                case 8:
                    _e.sent();
                    return [4 /*yield*/, prisma.team.deleteMany()];
                case 9:
                    _e.sent();
                    return [4 /*yield*/, prisma.project.deleteMany()];
                case 10:
                    _e.sent();
                    return [4 /*yield*/, prisma.license.deleteMany()];
                case 11:
                    _e.sent();
                    return [4 /*yield*/, prisma.category.deleteMany()];
                case 12:
                    _e.sent();
                    return [4 /*yield*/, prisma.minecraftVersion.deleteMany()];
                case 13:
                    _e.sent();
                    return [4 /*yield*/, prisma.user.deleteMany()];
                case 14:
                    _e.sent();
                    console.log('  → Seeding categories');
                    _i = 0, CATEGORIES_1 = CATEGORIES;
                    _e.label = 15;
                case 15:
                    if (!(_i < CATEGORIES_1.length)) return [3 /*break*/, 18];
                    category = CATEGORIES_1[_i];
                    return [4 /*yield*/, prisma.category.create({ data: category })];
                case 16:
                    _e.sent();
                    _e.label = 17;
                case 17:
                    _i++;
                    return [3 /*break*/, 15];
                case 18:
                    console.log('  → Seeding Minecraft versions');
                    _a = 0, MINECRAFT_VERSIONS_1 = MINECRAFT_VERSIONS;
                    _e.label = 19;
                case 19:
                    if (!(_a < MINECRAFT_VERSIONS_1.length)) return [3 /*break*/, 22];
                    version = MINECRAFT_VERSIONS_1[_a];
                    return [4 /*yield*/, prisma.minecraftVersion.create({ data: version })];
                case 20:
                    _e.sent();
                    _e.label = 21;
                case 21:
                    _a++;
                    return [3 /*break*/, 19];
                case 22:
                    console.log('  → Seeding users');
                    return [4 /*yield*/, bcrypt.hash('password123', 10)];
                case 23:
                    passwordHash = _e.sent();
                    _b = 0, USERS_1 = USERS;
                    _e.label = 24;
                case 24:
                    if (!(_b < USERS_1.length)) return [3 /*break*/, 27];
                    user = USERS_1[_b];
                    return [4 /*yield*/, prisma.user.create({
                            data: __assign(__assign({}, user), { passwordHash: passwordHash, emailVerified: true }),
                        })];
                case 25:
                    _e.sent();
                    _e.label = 26;
                case 26:
                    _b++;
                    return [3 /*break*/, 24];
                case 27:
                    console.log('  → Seeding sample projects');
                    fabricLoaderId = "loader-".concat(Date.now(), "-fabric");
                    return [4 /*yield*/, prisma.minecraftVersion.findFirst({ where: { version: '1.21.1' } })];
                case 28:
                    mc121 = _e.sent();
                    return [4 /*yield*/, prisma.minecraftVersion.findFirst({ where: { version: '1.20.1' } })];
                case 29:
                    mc120 = _e.sent();
                    _c = 0, SAMPLE_PROJECTS_1 = SAMPLE_PROJECTS;
                    _e.label = 30;
                case 30:
                    if (!(_c < SAMPLE_PROJECTS_1.length)) return [3 /*break*/, 39];
                    project = SAMPLE_PROJECTS_1[_c];
                    return [4 /*yield*/, prisma.user.findUnique({ where: { username: project.authorUsername } })];
                case 31:
                    author = _e.sent();
                    return [4 /*yield*/, prisma.category.findUnique({ where: { slug: project.categorySlug } })];
                case 32:
                    category = _e.sent();
                    if (!author || !category)
                        return [3 /*break*/, 38];
                    return [4 /*yield*/, prisma.project.create({
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
                        })];
                case 33:
                    created = _e.sent();
                    return [4 /*yield*/, prisma.projectVersion.create({
                            data: {
                                version: '1.0.0',
                                changelog: 'Initial release.',
                                fileUrl: "https://cdn.example.com/files/".concat(project.slug, "-1.0.0.jar"),
                                fileSize: 1024 * 250,
                                hash: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
                                downloads: Math.floor(project.downloads * 0.6),
                                status: client_1.VersionStatus.APPROVED,
                                projectId: created.id,
                            },
                        })];
                case 34:
                    version = _e.sent();
                    return [4 /*yield*/, prisma.loader.create({
                            data: {
                                type: client_1.LoaderType.FABRIC,
                                versionString: '0.15.0',
                                projectId: created.id,
                                versionId: version.id,
                            },
                        })];
                case 35:
                    _e.sent();
                    return [4 /*yield*/, prisma.team.create({
                            data: {
                                name: "".concat(project.title, " Team"),
                                description: "Official development team for ".concat(project.title, "."),
                                projectId: created.id,
                            },
                        })];
                case 36:
                    team = _e.sent();
                    return [4 /*yield*/, prisma.teamMember.create({
                            data: {
                                role: 'OWNER',
                                userId: author.id,
                                teamId: team.id,
                                projectId: created.id,
                            },
                        })];
                case 37:
                    _e.sent();
                    _e.label = 38;
                case 38:
                    _c++;
                    return [3 /*break*/, 30];
                case 39:
                    console.log('  → Seeding subscription plans');
                    plans = [
                        { name: 'Free', slug: 'free', tier: 'FREE', price: 0, interval: 'month', description: 'Get started with basic features', features: ['Upload up to 5 projects', 'Basic analytics', 'Community support'], popular: false },
                        { name: 'Creator', slug: 'creator_monthly', tier: 'CREATOR', price: 499, interval: 'month', description: 'For active mod creators', features: ['Unlimited projects', 'Advanced analytics', 'API key PRO tier', 'Priority support', 'Custom profile banner'], popular: true },
                        { name: 'Creator Yearly', slug: 'creator_yearly', tier: 'CREATOR', price: 4999, interval: 'year', description: 'Two months free', features: ['Everything in Creator Monthly', '2 months free', 'Early access features'], popular: false },
                        { name: 'Pro', slug: 'pro_monthly', tier: 'PRO', price: 1499, interval: 'month', description: 'For professional studios', features: ['Everything in Creator', 'Unlimited API keys', 'API key ENTERPRISE tier', 'Team management', 'Promoted project listings', 'Dedicated support'], popular: false },
                        { name: 'Pro Yearly', slug: 'pro_yearly', tier: 'PRO', price: 14999, interval: 'year', description: 'Best value for studios', features: ['Everything in Pro Monthly', '2 months free', 'White-label options'], popular: false },
                    ];
                    _d = 0, plans_1 = plans;
                    _e.label = 40;
                case 40:
                    if (!(_d < plans_1.length)) return [3 /*break*/, 43];
                    plan = plans_1[_d];
                    return [4 /*yield*/, prisma.subscriptionPlan.create({ data: plan })];
                case 41:
                    _e.sent();
                    _e.label = 42;
                case 42:
                    _d++;
                    return [3 /*break*/, 40];
                case 43:
                    console.log('  → Seeding licenses');
                    return [4 /*yield*/, seedLicenses()];
                case 44:
                    _e.sent();
                    console.log('✅ Seed complete!');
                    console.log("   \u2022 ".concat(CATEGORIES.length, " categories"));
                    console.log("   \u2022 ".concat(MINECRAFT_VERSIONS.length, " Minecraft versions"));
                    console.log("   \u2022 ".concat(USERS.length, " users"));
                    console.log("   \u2022 ".concat(SAMPLE_PROJECTS.length, " sample projects"));
                    console.log("   \u2022 ".concat(LICENSES.length, " licenses"));
                    console.log('');
                    console.log('📋 Demo Accounts:');
                    console.log('   Admin: demo@admin.com / DemoAdmin1');
                    console.log('   User:  demo@user.com / DemoUser1');
                    console.log('   Owner: admin@minecraftplatform.com / password123');
                    console.log('   (All seed users use password: "password123")');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
