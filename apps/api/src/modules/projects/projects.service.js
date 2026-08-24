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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var pagination_1 = require("../../common/pagination");
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(value) {
    return UUID_RE.test(value);
}
var ProjectsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ProjectsService = _classThis = /** @class */ (function () {
        function ProjectsService_1(prisma, analyticsQueue, searchIndexQueue) {
            this.prisma = prisma;
            this.analyticsQueue = analyticsQueue;
            this.searchIndexQueue = searchIndexQueue;
            this.logger = new common_1.Logger(ProjectsService.name);
        }
        /**
         * Resolve a project by id (UUID) OR slug. Returns the formatted project or
         * throws NotFoundException. If `trackView` is true (default), increments
         * the view counter and emits an analytics event — set to false on
         * background lookups where the caller doesn't want side effects.
         */
        ProjectsService_1.prototype.findByIdOrSlug = function (idOrSlug_1) {
            return __awaiter(this, arguments, void 0, function (idOrSlug, opts) {
                var trackView, where, project;
                var _this = this;
                var _a;
                if (opts === void 0) { opts = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            trackView = (_a = opts.trackView) !== null && _a !== void 0 ? _a : true;
                            where = isUuid(idOrSlug)
                                ? { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }
                                : { slug: idOrSlug };
                            return [4 /*yield*/, this.prisma.project.findFirst({
                                    where: where,
                                    include: {
                                        author: { select: { id: true, username: true, avatarUrl: true } },
                                        category: { select: { id: true, name: true, slug: true } },
                                        loaders: { select: { type: true } },
                                        versions: {
                                            where: { status: 'APPROVED' },
                                            orderBy: { createdAt: 'desc' },
                                            take: 1,
                                            select: { id: true, version: true, downloads: true, createdAt: true, status: true },
                                        },
                                        galleryImages: {
                                            orderBy: { order: 'asc' },
                                            select: {
                                                id: true,
                                                type: true,
                                                url: true,
                                                thumbnailUrl: true,
                                                alt: true,
                                                width: true,
                                                height: true,
                                                order: true,
                                            },
                                        },
                                        license: { select: { id: true, shortId: true, name: true, type: true, url: true } },
                                    },
                                })];
                        case 1:
                            project = _b.sent();
                            if (!project) {
                                throw new common_1.NotFoundException("Project \"".concat(idOrSlug, "\" not found"));
                            }
                            if (trackView) {
                                this.prisma.project.update({
                                    where: { id: project.id },
                                    data: { views: { increment: 1 } },
                                }).catch(function (err) { return _this.logger.warn("Failed to increment view count: ".concat(err.message)); });
                                this.analyticsQueue.add('pageview', { projectId: project.id }).catch(function (err) {
                                    return _this.logger.warn("Failed to enqueue analytics: ".concat(err.message));
                                });
                            }
                            return [2 /*return*/, this.formatProject(project)];
                    }
                });
            });
        };
        /** Strict 404 helper — useful for routes that accept id or slug. */
        ProjectsService_1.prototype.findProjectOr404 = function (idOrSlug) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.findByIdOrSlug(idOrSlug, { trackView: false })];
                });
            });
        };
        /**
         * Bulk fetch projects by a list of ids (and/or slugs). Returns formatted
         * projects in input order when possible. Missing ids are silently dropped
         * to match Modrinth/CurseForge behavior.
         */
        ProjectsService_1.prototype.findByIds = function (ids) {
            return __awaiter(this, void 0, void 0, function () {
                var normalized, uuidFilter, slugFilter, projects;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!ids.length)
                                return [2 /*return*/, []];
                            normalized = Array.from(new Set(ids.filter(Boolean)));
                            uuidFilter = normalized.filter(isUuid);
                            slugFilter = normalized.filter(function (v) { return !isUuid(v); });
                            return [4 /*yield*/, this.prisma.project.findMany({
                                    where: {
                                        OR: __spreadArray(__spreadArray(__spreadArray([], (uuidFilter.length ? [{ id: { in: uuidFilter } }] : []), true), (uuidFilter.length ? [{ slug: { in: uuidFilter } }] : []), true), (slugFilter.length ? [{ slug: { in: slugFilter } }] : []), true),
                                    },
                                    include: {
                                        author: { select: { id: true, username: true, avatarUrl: true } },
                                        category: { select: { id: true, name: true, slug: true } },
                                        loaders: { select: { type: true } },
                                        versions: {
                                            where: { status: 'APPROVED' },
                                            orderBy: { createdAt: 'desc' },
                                            take: 1,
                                            select: { version: true },
                                        },
                                        license: { select: { id: true, shortId: true, name: true, type: true, url: true } },
                                    },
                                })];
                        case 1:
                            projects = _a.sent();
                            return [2 /*return*/, projects.map(function (p) { return _this.formatProject(p); })];
                    }
                });
            });
        };
        /**
         * Generate a URL-safe slug from a title string.
         * Appends a short random suffix if a collision is detected.
         */
        ProjectsService_1.prototype.generateUniqueSlug = function (title, existingId) {
            return __awaiter(this, void 0, void 0, function () {
                var baseSlug, slug, attempts, maxAttempts, existing, suffix;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            baseSlug = title
                                .toLowerCase()
                                .replace(/\s+/g, '-')
                                .replace(/[^a-z0-9-]/g, '')
                                .replace(/-+/g, '-')
                                .replace(/^-|-$/g, '')
                                || 'project';
                            slug = baseSlug;
                            attempts = 0;
                            maxAttempts = 10;
                            _a.label = 1;
                        case 1:
                            if (!(attempts < maxAttempts)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.project.findUnique({ where: { slug: slug } })];
                        case 2:
                            existing = _a.sent();
                            if (!existing || (existingId && existing.id === existingId)) {
                                return [2 /*return*/, slug];
                            }
                            suffix = Math.random().toString(36).substring(2, 6);
                            slug = "".concat(baseSlug, "-").concat(suffix);
                            attempts++;
                            return [3 /*break*/, 1];
                        case 3: 
                        // Fallback: extremely unlikely, but use uuid fragment
                        return [2 /*return*/, "".concat(baseSlug, "-").concat(Math.random().toString(36).substring(2, 8))];
                    }
                });
            });
        };
        ProjectsService_1.prototype.create = function (dto, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var slug, project;
                var _this = this;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, this.generateUniqueSlug(dto.title)];
                        case 1:
                            slug = _d.sent();
                            return [4 /*yield*/, this.prisma.project.create({
                                    data: {
                                        title: dto.title,
                                        slug: slug,
                                        description: dto.description,
                                        body: dto.body,
                                        iconUrl: dto.iconUrl,
                                        coverUrl: dto.coverUrl,
                                        sourceUrl: dto.sourceUrl,
                                        discordUrl: dto.discordUrl,
                                        wikiUrl: dto.wikiUrl,
                                        clientSide: (_a = dto.clientSide) !== null && _a !== void 0 ? _a : true,
                                        serverSide: (_b = dto.serverSide) !== null && _b !== void 0 ? _b : true,
                                        projectType: (_c = dto.projectType) !== null && _c !== void 0 ? _c : client_1.ProjectType.MOD,
                                        status: client_1.ProjectStatus.DRAFT,
                                        authorId: userId,
                                        categoryId: dto.categoryId,
                                    },
                                    include: {
                                        author: {
                                            select: { id: true, username: true, avatarUrl: true },
                                        },
                                        category: {
                                            select: { id: true, name: true, slug: true },
                                        },
                                        loaders: true,
                                    },
                                })];
                        case 2:
                            project = _d.sent();
                            this.searchIndexQueue.add('upsert', { projectId: project.id }).catch(function (err) {
                                return _this.logger.warn("Failed to enqueue search-index: ".concat(err.message));
                            });
                            return [2 /*return*/, this.formatProject(project)];
                    }
                });
            });
        };
        ProjectsService_1.prototype.findAll = function (query) {
            return __awaiter(this, void 0, void 0, function () {
                var page, limit, skip, order, sort, where, conditions, allowedSortFields, sortField, _a, projects, total;
                var _b;
                var _this = this;
                var _c, _d, _e, _f;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            page = (_c = query.page) !== null && _c !== void 0 ? _c : 1;
                            limit = (_d = query.limit) !== null && _d !== void 0 ? _d : 20;
                            skip = (page - 1) * limit;
                            order = (_e = query.order) !== null && _e !== void 0 ? _e : 'desc';
                            sort = (_f = query.sort) !== null && _f !== void 0 ? _f : 'createdAt';
                            where = {};
                            conditions = [];
                            if (query.search) {
                                conditions.push({
                                    OR: [
                                        { title: { contains: query.search } },
                                        { description: { contains: query.search } },
                                    ],
                                });
                            }
                            if (query.category) {
                                conditions.push({
                                    category: { slug: query.category },
                                });
                            }
                            if (query.loader) {
                                conditions.push({
                                    loaders: {
                                        some: {
                                            type: query.loader,
                                        },
                                    },
                                });
                            }
                            if (query.status) {
                                conditions.push({ status: query.status });
                            }
                            if (query.projectType) {
                                conditions.push({ projectType: query.projectType });
                            }
                            if (query.author) {
                                conditions.push({ authorId: query.author });
                            }
                            if (conditions.length > 0) {
                                where.AND = conditions;
                            }
                            allowedSortFields = ['downloads', 'updatedAt', 'createdAt', 'title'];
                            sortField = allowedSortFields.includes(sort) ? sort : 'createdAt';
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.project.findMany({
                                        where: where,
                                        skip: skip,
                                        take: limit,
                                        orderBy: [{ promotedUntil: { sort: 'desc', nulls: 'last' } }, (_b = {}, _b[sortField] = order, _b)],
                                        include: {
                                            author: {
                                                select: { id: true, username: true, avatarUrl: true },
                                            },
                                            category: {
                                                select: { id: true, name: true, slug: true },
                                            },
                                            loaders: {
                                                select: { type: true },
                                            },
                                            versions: {
                                                where: { status: 'APPROVED' },
                                                orderBy: { createdAt: 'desc' },
                                                take: 1,
                                                select: { version: true },
                                            },
                                        },
                                    }),
                                    this.prisma.project.count({ where: where }),
                                ])];
                        case 1:
                            _a = _g.sent(), projects = _a[0], total = _a[1];
                            return [2 /*return*/, {
                                    data: projects.map(function (p) { return _this.formatProject(p); }),
                                    meta: {
                                        page: page,
                                        limit: limit,
                                        total: total,
                                        totalPages: Math.ceil(total / limit),
                                    },
                                }];
                    }
                });
            });
        };
        /**
         * Cursor-based pagination. Returns `{ data, nextCursor, hasMore }` and
         * supports the same filters as `findAll` (search, category, loader, status,
         * projectType, author, license). The cursor encodes the last-seen project's
         * id; clients pass it back unchanged on the next call.
         */
        ProjectsService_1.prototype.findAllCursor = function (query) {
            return __awaiter(this, void 0, void 0, function () {
                var where, conditions, order, sort, allowedSortFields, sortField;
                var _a;
                var _this = this;
                var _b, _c, _d;
                return __generator(this, function (_e) {
                    where = {};
                    conditions = [];
                    if (query.search) {
                        conditions.push({
                            OR: [
                                { title: { contains: query.search } },
                                { description: { contains: query.search } },
                            ],
                        });
                    }
                    if (query.category)
                        conditions.push({ category: { slug: query.category } });
                    if (query.loader)
                        conditions.push({ loaders: { some: { type: query.loader } } });
                    if (query.status)
                        conditions.push({ status: query.status });
                    if (query.projectType)
                        conditions.push({ projectType: query.projectType });
                    if (query.author)
                        conditions.push({ authorId: query.author });
                    if (query.license)
                        conditions.push({ licenseId: query.license });
                    if (conditions.length > 0)
                        where.AND = conditions;
                    order = (_b = query.order) !== null && _b !== void 0 ? _b : 'desc';
                    sort = (_c = query.sort) !== null && _c !== void 0 ? _c : 'createdAt';
                    allowedSortFields = ['downloads', 'updatedAt', 'createdAt', 'title'];
                    sortField = allowedSortFields.includes(sort) ? sort : 'createdAt';
                    return [2 /*return*/, (0, pagination_1.paginateCursor)({
                            take: (_d = query.limit) !== null && _d !== void 0 ? _d : 20,
                            cursor: query.cursor,
                            where: where,
                            orderBy: (_a = {}, _a[sortField] = order, _a),
                            prismaDelegate: {
                                findMany: function (args) { return _this.prisma.project.findMany(__assign(__assign({}, args), { include: {
                                        author: { select: { id: true, username: true, avatarUrl: true } },
                                        category: { select: { id: true, name: true, slug: true } },
                                        loaders: { select: { type: true } },
                                        versions: {
                                            where: { status: 'APPROVED' },
                                            orderBy: { createdAt: 'desc' },
                                            take: 1,
                                            select: { version: true },
                                        },
                                        license: { select: { id: true, shortId: true, name: true, type: true, url: true } },
                                    } })); },
                            },
                        }).then(function (page) { return (__assign(__assign({}, page), { data: page.data.map(function (p) { return _this.formatProject(p); }) })); })];
                });
            });
        };
        ProjectsService_1.prototype.findBySlug = function (slug) {
            return __awaiter(this, void 0, void 0, function () {
                var isUuid, project;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
                            return [4 /*yield*/, this.prisma.project.findFirst({
                                    where: isUuid ? { OR: [{ slug: slug }, { id: slug }] } : { slug: slug },
                                    include: {
                                        author: {
                                            select: { id: true, username: true, avatarUrl: true },
                                        },
                                        category: {
                                            select: { id: true, name: true, slug: true },
                                        },
                                        loaders: {
                                            select: { type: true },
                                        },
                                        versions: {
                                            where: { status: 'APPROVED' },
                                            orderBy: { createdAt: 'desc' },
                                            take: 1,
                                            select: { id: true, version: true, downloads: true, createdAt: true, status: true },
                                        },
                                        galleryImages: {
                                            orderBy: { order: 'asc' },
                                            select: {
                                                id: true,
                                                type: true,
                                                url: true,
                                                thumbnailUrl: true,
                                                alt: true,
                                                width: true,
                                                height: true,
                                                order: true,
                                            },
                                        },
                                    },
                                })];
                        case 1:
                            project = _a.sent();
                            if (!project) {
                                throw new common_1.NotFoundException("Project not found");
                            }
                            this.prisma.project.update({
                                where: { id: project.id },
                                data: { views: { increment: 1 } },
                            }).catch(function (err) { return _this.logger.warn("Failed to increment view count: ".concat(err.message)); });
                            this.analyticsQueue.add('pageview', { projectId: project.id }).catch(function (err) {
                                return _this.logger.warn("Failed to enqueue analytics: ".concat(err.message));
                            });
                            return [2 /*return*/, this.formatProject(project)];
                    }
                });
            });
        };
        ProjectsService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var project;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({
                                where: { id: id },
                                include: {
                                    author: {
                                        select: { id: true, username: true, avatarUrl: true },
                                    },
                                    category: {
                                        select: { id: true, name: true, slug: true },
                                    },
                                    loaders: {
                                        select: { type: true },
                                    },
                                    versions: {
                                        orderBy: { createdAt: 'desc' },
                                        select: { id: true, version: true, downloads: true, createdAt: true, status: true },
                                    },
                                },
                            })];
                        case 1:
                            project = _a.sent();
                            if (!project) {
                                throw new common_1.NotFoundException("Project with id \"".concat(id, "\" not found"));
                            }
                            return [2 /*return*/, this.formatProject(project)];
                    }
                });
            });
        };
        ProjectsService_1.prototype.update = function (id, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var existing, updateData, _a, project;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({ where: { id: id } })];
                        case 1:
                            existing = _b.sent();
                            if (!existing) {
                                throw new common_1.NotFoundException("Project with id \"".concat(id, "\" not found"));
                            }
                            updateData = {};
                            if (!(dto.title !== undefined)) return [3 /*break*/, 3];
                            // If title changed, regenerate slug
                            updateData.title = dto.title;
                            _a = updateData;
                            return [4 /*yield*/, this.generateUniqueSlug(dto.title, id)];
                        case 2:
                            _a.slug = _b.sent();
                            _b.label = 3;
                        case 3:
                            if (dto.description !== undefined)
                                updateData.description = dto.description;
                            if (dto.body !== undefined)
                                updateData.body = dto.body;
                            if (dto.iconUrl !== undefined)
                                updateData.iconUrl = dto.iconUrl;
                            if (dto.coverUrl !== undefined)
                                updateData.coverUrl = dto.coverUrl;
                            if (dto.sourceUrl !== undefined)
                                updateData.sourceUrl = dto.sourceUrl;
                            if (dto.discordUrl !== undefined)
                                updateData.discordUrl = dto.discordUrl;
                            if (dto.wikiUrl !== undefined)
                                updateData.wikiUrl = dto.wikiUrl;
                            if (dto.clientSide !== undefined)
                                updateData.clientSide = dto.clientSide;
                            if (dto.serverSide !== undefined)
                                updateData.serverSide = dto.serverSide;
                            if (dto.projectType !== undefined)
                                updateData.projectType = dto.projectType;
                            if (dto.categoryId !== undefined) {
                                updateData.category = dto.categoryId
                                    ? { connect: { id: dto.categoryId } }
                                    : { disconnect: true };
                            }
                            return [4 /*yield*/, this.prisma.project.update({
                                    where: { id: id },
                                    data: updateData,
                                    include: {
                                        author: {
                                            select: { id: true, username: true, avatarUrl: true },
                                        },
                                        category: {
                                            select: { id: true, name: true, slug: true },
                                        },
                                        loaders: {
                                            select: { type: true },
                                        },
                                        versions: {
                                            orderBy: { createdAt: 'desc' },
                                            take: 1,
                                            select: { id: true, version: true },
                                        },
                                    },
                                })];
                        case 4:
                            project = _b.sent();
                            this.searchIndexQueue.add('upsert', { projectId: id }).catch(function (err) {
                                return _this.logger.warn("Failed to enqueue search-index: ".concat(err.message));
                            });
                            return [2 /*return*/, this.formatProject(project)];
                    }
                });
            });
        };
        ProjectsService_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var existing;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({ where: { id: id } })];
                        case 1:
                            existing = _a.sent();
                            if (!existing) {
                                throw new common_1.NotFoundException("Project with id \"".concat(id, "\" not found"));
                            }
                            return [4 /*yield*/, this.prisma.$transaction([
                                    this.prisma.loader.deleteMany({ where: { projectId: id } }),
                                    this.prisma.dependency.deleteMany({ where: { dependentId: id } }),
                                    this.prisma.dependency.deleteMany({ where: { requiredId: id } }),
                                    this.prisma.comment.deleteMany({ where: { projectId: id } }),
                                    this.prisma.review.deleteMany({ where: { projectId: id } }),
                                    this.prisma.follow.deleteMany({ where: { projectId: id } }),
                                    this.prisma.teamMember.deleteMany({ where: { projectId: id } }),
                                    this.prisma.team.deleteMany({ where: { projectId: id } }),
                                    this.prisma.download.deleteMany({ where: { projectId: id } }),
                                    this.prisma.projectVersion.deleteMany({ where: { projectId: id } }),
                                    this.prisma.project.delete({ where: { id: id } }),
                                ])];
                        case 2:
                            _a.sent();
                            this.searchIndexQueue.add('delete', { projectId: id }).catch(function (err) {
                                return _this.logger.warn("Failed to enqueue search-index: ".concat(err.message));
                            });
                            return [2 /*return*/];
                    }
                });
            });
        };
        ProjectsService_1.prototype.getRelatedProjects = function (categoryId_1, excludeId_1) {
            return __awaiter(this, arguments, void 0, function (categoryId, excludeId, limit) {
                var projects;
                var _this = this;
                if (limit === void 0) { limit = 6; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findMany({
                                where: {
                                    categoryId: categoryId,
                                    id: { not: excludeId },
                                    status: client_1.ProjectStatus.PUBLISHED,
                                },
                                take: limit,
                                orderBy: { downloads: 'desc' },
                                include: {
                                    author: {
                                        select: { id: true, username: true, avatarUrl: true },
                                    },
                                    category: {
                                        select: { id: true, name: true, slug: true },
                                    },
                                    loaders: {
                                        select: { type: true },
                                    },
                                },
                            })];
                        case 1:
                            projects = _a.sent();
                            return [2 /*return*/, projects.map(function (p) { return _this.formatProject(p); })];
                    }
                });
            });
        };
        ProjectsService_1.prototype.incrementDownloads = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.update({
                                where: { id: id },
                                data: { downloads: { increment: 1 } },
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Format a Prisma project object into the API response shape.
         * Converts dates to ISO strings, nulls to undefined, and extracts loader types.
         */
        ProjectsService_1.prototype.formatProject = function (project) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
            var loaderTypes = (_b = (_a = project.loaders) === null || _a === void 0 ? void 0 : _a.map(function (l) {
                return typeof l === 'string' ? l : l.type;
            })) !== null && _b !== void 0 ? _b : [];
            return {
                id: project.id,
                title: project.title,
                slug: project.slug,
                description: project.description,
                body: (_c = project.body) !== null && _c !== void 0 ? _c : undefined,
                iconUrl: (_d = project.iconUrl) !== null && _d !== void 0 ? _d : undefined,
                coverUrl: (_e = project.coverUrl) !== null && _e !== void 0 ? _e : undefined,
                sourceUrl: (_f = project.sourceUrl) !== null && _f !== void 0 ? _f : undefined,
                discordUrl: (_g = project.discordUrl) !== null && _g !== void 0 ? _g : undefined,
                wikiUrl: (_h = project.wikiUrl) !== null && _h !== void 0 ? _h : undefined,
                downloads: project.downloads,
                views: project.views,
                status: project.status,
                projectType: project.projectType,
                featured: project.featured,
                promotedUntil: (_m = (_l = (_k = (_j = project.promotedUntil) === null || _j === void 0 ? void 0 : _j.toISOString) === null || _k === void 0 ? void 0 : _k.call(_j)) !== null && _l !== void 0 ? _l : project.promotedUntil) !== null && _m !== void 0 ? _m : undefined,
                clientSide: project.clientSide,
                serverSide: project.serverSide,
                authorId: project.authorId,
                categoryId: (_o = project.categoryId) !== null && _o !== void 0 ? _o : undefined,
                createdAt: project.createdAt instanceof Date
                    ? project.createdAt.toISOString()
                    : project.createdAt,
                updatedAt: project.updatedAt instanceof Date
                    ? project.updatedAt.toISOString()
                    : project.updatedAt,
                author: project.author
                    ? {
                        id: project.author.id,
                        username: project.author.username,
                        avatarUrl: (_p = project.author.avatarUrl) !== null && _p !== void 0 ? _p : undefined,
                    }
                    : undefined,
                category: project.category
                    ? {
                        id: project.category.id,
                        name: project.category.name,
                        slug: project.category.slug,
                    }
                    : undefined,
                loaders: loaderTypes,
                latestVersion: (_s = (_r = (_q = project.versions) === null || _q === void 0 ? void 0 : _q[0]) === null || _r === void 0 ? void 0 : _r.version) !== null && _s !== void 0 ? _s : undefined,
                ratingAverage: (_t = project.ratingAverage) !== null && _t !== void 0 ? _t : 0,
                ratingCount: (_u = project.ratingCount) !== null && _u !== void 0 ? _u : 0,
                licenseId: (_v = project.licenseId) !== null && _v !== void 0 ? _v : undefined,
                license: project.license
                    ? {
                        id: project.license.id,
                        shortId: project.license.shortId,
                        name: project.license.name,
                        type: project.license.type,
                        url: (_w = project.license.url) !== null && _w !== void 0 ? _w : undefined,
                    }
                    : undefined,
                galleryImages: (_x = project.galleryImages) !== null && _x !== void 0 ? _x : [],
            };
        };
        return ProjectsService_1;
    }());
    __setFunctionName(_classThis, "ProjectsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProjectsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProjectsService = _classThis;
}();
exports.ProjectsService = ProjectsService;
