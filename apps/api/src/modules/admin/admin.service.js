"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
var common_1 = require("@nestjs/common");
var AdminService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AdminService = _classThis = /** @class */ (function () {
        function AdminService_1(prisma) {
            this.prisma = prisma;
            this.logger = new common_1.Logger(AdminService.name);
        }
        AdminService_1.prototype.listUsers = function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var page, limit, search, role, banned, where, _a, users, total;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            page = params.page, limit = params.limit, search = params.search, role = params.role, banned = params.banned;
                            where = {};
                            if (search) {
                                where.OR = [
                                    { username: { contains: search, mode: 'insensitive' } },
                                    { email: { contains: search, mode: 'insensitive' } },
                                ];
                            }
                            if (role)
                                where.role = role;
                            if (banned !== undefined)
                                where.banned = banned;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.user.findMany({
                                        where: where,
                                        skip: (page - 1) * limit,
                                        take: limit,
                                        orderBy: { createdAt: 'desc' },
                                        select: {
                                            id: true,
                                            username: true,
                                            displayName: true,
                                            email: true,
                                            role: true,
                                            creatorTier: true,
                                            banned: true,
                                            avatarUrl: true,
                                            createdAt: true,
                                            updatedAt: true,
                                            _count: { select: { projects: true } },
                                        },
                                    }),
                                    this.prisma.user.count({ where: where }),
                                ])];
                        case 1:
                            _a = _b.sent(), users = _a[0], total = _a[1];
                            return [2 /*return*/, {
                                    data: users.map(function (u) {
                                        var _a, _b;
                                        return ({
                                            id: u.id,
                                            username: u.username,
                                            displayName: (_a = u.displayName) !== null && _a !== void 0 ? _a : undefined,
                                            email: u.email,
                                            role: u.role,
                                            creatorTier: u.creatorTier,
                                            banned: u.banned,
                                            avatarUrl: (_b = u.avatarUrl) !== null && _b !== void 0 ? _b : undefined,
                                            joined: u.createdAt instanceof Date ? u.createdAt.toISOString().split('T')[0] : u.createdAt,
                                            projects: u._count.projects,
                                        });
                                    }),
                                    meta: { page: page, limit: limit, total: total, totalPages: Math.ceil(total / limit) },
                                }];
                    }
                });
            });
        };
        AdminService_1.prototype.changeUserRole = function (userId, role) {
            return __awaiter(this, void 0, void 0, function () {
                var user, updated;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: userId } })];
                        case 1:
                            user = _c.sent();
                            if (!user)
                                throw new common_1.NotFoundException('User not found');
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: userId },
                                    data: { role: role },
                                    select: {
                                        id: true,
                                        username: true,
                                        displayName: true,
                                        email: true,
                                        role: true,
                                        banned: true,
                                        avatarUrl: true,
                                    },
                                })];
                        case 2:
                            updated = _c.sent();
                            return [2 /*return*/, {
                                    id: updated.id,
                                    username: updated.username,
                                    displayName: (_a = updated.displayName) !== null && _a !== void 0 ? _a : undefined,
                                    email: updated.email,
                                    role: updated.role,
                                    banned: updated.banned,
                                    avatarUrl: (_b = updated.avatarUrl) !== null && _b !== void 0 ? _b : undefined,
                                }];
                    }
                });
            });
        };
        AdminService_1.prototype.changeUserTier = function (userId, tier) {
            return __awaiter(this, void 0, void 0, function () {
                var user, updated;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: userId } })];
                        case 1:
                            user = _b.sent();
                            if (!user)
                                throw new common_1.NotFoundException('User not found');
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: userId },
                                    data: { creatorTier: tier },
                                    select: {
                                        id: true,
                                        username: true,
                                        displayName: true,
                                        email: true,
                                        role: true,
                                        creatorTier: true,
                                        banned: true,
                                    },
                                })];
                        case 2:
                            updated = _b.sent();
                            return [2 /*return*/, {
                                    id: updated.id,
                                    username: updated.username,
                                    displayName: (_a = updated.displayName) !== null && _a !== void 0 ? _a : undefined,
                                    email: updated.email,
                                    role: updated.role,
                                    creatorTier: updated.creatorTier,
                                    banned: updated.banned,
                                }];
                    }
                });
            });
        };
        AdminService_1.prototype.banUser = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: userId } })];
                        case 1:
                            user = _a.sent();
                            if (!user)
                                throw new common_1.NotFoundException('User not found');
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: userId },
                                    data: { banned: true },
                                    select: {
                                        id: true,
                                        username: true,
                                        displayName: true,
                                        email: true,
                                        role: true,
                                        banned: true,
                                    },
                                })];
                        case 2:
                            updated = _a.sent();
                            return [2 /*return*/, updated];
                    }
                });
            });
        };
        AdminService_1.prototype.unbanUser = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: userId } })];
                        case 1:
                            user = _a.sent();
                            if (!user)
                                throw new common_1.NotFoundException('User not found');
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: userId },
                                    data: { banned: false },
                                    select: {
                                        id: true,
                                        username: true,
                                        displayName: true,
                                        email: true,
                                        role: true,
                                        banned: true,
                                    },
                                })];
                        case 2:
                            updated = _a.sent();
                            return [2 /*return*/, updated];
                    }
                });
            });
        };
        AdminService_1.prototype.updateProjectStatus = function (projectId, status) {
            return __awaiter(this, void 0, void 0, function () {
                var project, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({ where: { id: projectId } })];
                        case 1:
                            project = _a.sent();
                            if (!project)
                                throw new common_1.NotFoundException('Project not found');
                            return [4 /*yield*/, this.prisma.project.update({
                                    where: { id: projectId },
                                    data: { status: status },
                                    include: {
                                        author: { select: { id: true, username: true, avatarUrl: true } },
                                    },
                                })];
                        case 2:
                            updated = _a.sent();
                            return [2 /*return*/, this.formatProject(updated)];
                    }
                });
            });
        };
        AdminService_1.prototype.updateProjectFeature = function (projectId, featured) {
            return __awaiter(this, void 0, void 0, function () {
                var project, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({ where: { id: projectId } })];
                        case 1:
                            project = _a.sent();
                            if (!project)
                                throw new common_1.NotFoundException('Project not found');
                            return [4 /*yield*/, this.prisma.project.update({
                                    where: { id: projectId },
                                    data: { featured: featured },
                                    include: {
                                        author: { select: { id: true, username: true, avatarUrl: true } },
                                    },
                                })];
                        case 2:
                            updated = _a.sent();
                            return [2 /*return*/, this.formatProject(updated)];
                    }
                });
            });
        };
        AdminService_1.prototype.getAnalytics = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, totalUsers, totalProjects, totalDownloads, bannedUsers, pendingProjects, publishedProjects, archivedProjects, rejectedProjects, pendingReports, resolvedReports, dismissedReports, newUsersToday, newProjectsToday, downloadsToday;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                this.prisma.user.count(),
                                this.prisma.project.count(),
                                this.prisma.download.count(),
                                this.prisma.user.count({ where: { banned: true } }),
                                this.prisma.project.count({ where: { status: 'SUBMITTED' } }),
                                this.prisma.project.count({ where: { status: 'PUBLISHED' } }),
                                this.prisma.project.count({ where: { status: 'ARCHIVED' } }),
                                this.prisma.project.count({ where: { status: 'REJECTED' } }),
                                this.prisma.report.count({ where: { status: 'PENDING' } }),
                                this.prisma.report.count({ where: { status: 'RESOLVED' } }),
                                this.prisma.report.count({ where: { status: 'DISMISSED' } }),
                                this.prisma.user.count({
                                    where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
                                }),
                                this.prisma.project.count({
                                    where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
                                }),
                                this.prisma.download.count({
                                    where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
                                }),
                            ])];
                        case 1:
                            _a = _b.sent(), totalUsers = _a[0], totalProjects = _a[1], totalDownloads = _a[2], bannedUsers = _a[3], pendingProjects = _a[4], publishedProjects = _a[5], archivedProjects = _a[6], rejectedProjects = _a[7], pendingReports = _a[8], resolvedReports = _a[9], dismissedReports = _a[10], newUsersToday = _a[11], newProjectsToday = _a[12], downloadsToday = _a[13];
                            return [2 /*return*/, {
                                    users: { total: totalUsers, banned: bannedUsers },
                                    projects: {
                                        total: totalProjects,
                                        pending: pendingProjects,
                                        published: publishedProjects,
                                        archived: archivedProjects,
                                        rejected: rejectedProjects,
                                    },
                                    downloads: { total: totalDownloads, today: downloadsToday },
                                    reports: {
                                        pending: pendingReports,
                                        resolved: resolvedReports,
                                        dismissed: dismissedReports,
                                        total: pendingReports + resolvedReports + dismissedReports,
                                    },
                                    newUsersToday: newUsersToday,
                                    newProjectsToday: newProjectsToday,
                                }];
                    }
                });
            });
        };
        AdminService_1.prototype.formatProject = function (project) {
            var _a;
            return {
                id: project.id,
                title: project.title,
                slug: project.slug,
                description: project.description,
                downloads: project.downloads,
                status: project.status,
                featured: project.featured,
                authorId: project.authorId,
                createdAt: project.createdAt instanceof Date ? project.createdAt.toISOString() : project.createdAt,
                updatedAt: project.updatedAt instanceof Date ? project.updatedAt.toISOString() : project.updatedAt,
                author: project.author
                    ? {
                        id: project.author.id,
                        username: project.author.username,
                        avatarUrl: (_a = project.author.avatarUrl) !== null && _a !== void 0 ? _a : undefined,
                    }
                    : undefined,
            };
        };
        return AdminService_1;
    }());
    __setFunctionName(_classThis, "AdminService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AdminService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AdminService = _classThis;
}();
exports.AdminService = AdminService;
