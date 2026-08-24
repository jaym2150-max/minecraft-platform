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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
var common_1 = require("@nestjs/common");
var meilisearch_1 = require("meilisearch");
/**
 * Strict allow-lists for values interpolated into the Meilisearch filter DSL.
 *
 * SECURITY: Meilisearch filters are an expression language, NOT a parameterized
 * query. Interpolating raw user input (e.g. `categoryId = "<input>"`) lets an
 * attacker break out of the intended `status = 'PUBLISHED'` constraint and read
 * DRAFT / REJECTED / ARCHIVED projects, or inject arbitrary boolean expressions.
 * We therefore only ever emit enum members we control, and reject anything else.
 */
var ALLOWED_LOADER_VALUES = new Set([
    'FABRIC',
    'FORGE',
    'NEOFORGE',
    'QUILT',
    'BUKKIT',
    'SPIGOT',
    'PAPER',
    'PURPUR',
]);
var ALLOWED_SORTS = new Set([
    'downloads:desc',
    'downloads:asc',
    'views:desc',
    'views:asc',
    'createdAt:desc',
    'createdAt:asc',
    'updatedAt:desc',
    'updatedAt:asc',
]);
/**
 * Validate a category identifier. Categories are referenced by UUID in the
 * index (`categoryId`), so we require a strict UUID v4 shape. Anything else
 * (including filter-language metacharacters like `"`, `=`, spaces) is dropped.
 */
function isValidCategoryId(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
var SearchService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var SearchService = _classThis = /** @class */ (function () {
        function SearchService_1(config, prisma) {
            this.config = config;
            this.prisma = prisma;
            this.logger = new common_1.Logger(SearchService.name);
            this.client = null;
            this.projectIndex = null;
        }
        SearchService_1.prototype.onModuleInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                var url, apiKey, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = this.config.get('MEILISEARCH_URL');
                            apiKey = this.config.get('MEILISEARCH_API_KEY');
                            if (!url) {
                                this.logger.warn('MEILISEARCH_URL not configured - search disabled');
                                return [2 /*return*/];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            this.client = new meilisearch_1.MeiliSearch({ host: url, apiKey: apiKey });
                            this.projectIndex = this.client.index('projects');
                            return [4 /*yield*/, this.ensureIndex()];
                        case 2:
                            _a.sent();
                            this.logger.log('Meilisearch client initialized');
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            this.logger.error("Failed to initialize Meilisearch: ".concat(error_1.message));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        SearchService_1.prototype.ensureIndex = function () {
            return __awaiter(this, void 0, void 0, function () {
                var error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.projectIndex)
                                return [2 /*return*/];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.projectIndex.updateSettings({
                                    searchableAttributes: ['title', 'description', 'body', 'authorName', 'categoryName'],
                                    filterableAttributes: ['status', 'categoryId', 'loaders', 'authorId', 'featured'],
                                    sortableAttributes: ['downloads', 'views', 'createdAt', 'updatedAt'],
                                    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
                                })];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_2 = _a.sent();
                            this.logger.warn("Index settings update failed: ".concat(error_2.message));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        SearchService_1.prototype.search = function (query_1) {
            return __awaiter(this, arguments, void 0, function (query, options) {
                var page, limit, offset, filters, sort, result, error_3;
                var _a, _b, _c, _d;
                if (options === void 0) { options = {}; }
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            page = Math.max(1, Number((_a = options.page) !== null && _a !== void 0 ? _a : 1) || 1);
                            limit = Math.min(50, Math.max(1, Number((_b = options.limit) !== null && _b !== void 0 ? _b : 20) || 20));
                            offset = (page - 1) * limit;
                            if (!this.projectIndex) {
                                return [2 /*return*/, this.fallbackSearch(query, options, page, limit)];
                            }
                            _e.label = 1;
                        case 1:
                            _e.trys.push([1, 3, , 4]);
                            filters = ["status = 'PUBLISHED'"];
                            if (options.category && isValidCategoryId(options.category)) {
                                filters.push("categoryId = '".concat(options.category, "'"));
                            }
                            if (options.loader && ALLOWED_LOADER_VALUES.has(options.loader)) {
                                filters.push("loaders = '".concat(options.loader, "'"));
                            }
                            sort = options.sort && ALLOWED_SORTS.has(options.sort)
                                ? [options.sort]
                                : undefined;
                            return [4 /*yield*/, this.projectIndex.search(query, {
                                    limit: limit,
                                    offset: offset,
                                    filter: filters,
                                    sort: sort,
                                })];
                        case 2:
                            result = _e.sent();
                            return [2 /*return*/, {
                                    data: result.hits,
                                    meta: {
                                        page: page,
                                        limit: limit,
                                        total: (_c = result.estimatedTotalHits) !== null && _c !== void 0 ? _c : result.hits.length,
                                        totalPages: Math.ceil(((_d = result.estimatedTotalHits) !== null && _d !== void 0 ? _d : result.hits.length) / limit),
                                        query: query,
                                        processingTimeMs: result.processingTimeMs,
                                    },
                                }];
                        case 3:
                            error_3 = _e.sent();
                            this.logger.error("Search failed: ".concat(error_3.message));
                            return [2 /*return*/, this.fallbackSearch(query, options, page, limit)];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        SearchService_1.prototype.fallbackSearch = function (query, options, page, limit) {
            return __awaiter(this, void 0, void 0, function () {
                var where, orderBy, _a, projects, total;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            where = { status: 'PUBLISHED' };
                            if (query) {
                                where.OR = [
                                    { title: { contains: query, mode: 'insensitive' } },
                                    { description: { contains: query, mode: 'insensitive' } },
                                ];
                            }
                            if (options.category) {
                                where.category = { slug: options.category };
                            }
                            orderBy = { createdAt: 'desc' };
                            if (options.sort === 'downloads')
                                orderBy.downloads = 'desc';
                            if (options.sort === 'updatedAt')
                                orderBy.updatedAt = 'desc';
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.project.findMany({
                                        where: where,
                                        skip: (page - 1) * limit,
                                        take: limit,
                                        orderBy: orderBy,
                                        include: {
                                            author: { select: { id: true, username: true, avatarUrl: true } },
                                            category: { select: { id: true, name: true, slug: true } },
                                            loaders: { select: { type: true } },
                                        },
                                    }),
                                    this.prisma.project.count({ where: where }),
                                ])];
                        case 1:
                            _a = _b.sent(), projects = _a[0], total = _a[1];
                            return [2 /*return*/, {
                                    data: projects.map(function (p) { return ({
                                        id: p.id,
                                        title: p.title,
                                        slug: p.slug,
                                        description: p.description,
                                        downloads: p.downloads,
                                        views: p.views,
                                        iconUrl: p.iconUrl,
                                        status: p.status,
                                        author: p.author,
                                        category: p.category,
                                        loaders: p.loaders.map(function (l) { return l.type; }),
                                        createdAt: p.createdAt.toISOString(),
                                        updatedAt: p.updatedAt.toISOString(),
                                    }); }),
                                    meta: {
                                        page: page,
                                        limit: limit,
                                        total: total,
                                        totalPages: Math.ceil(total / limit),
                                        query: query,
                                        source: 'database',
                                    },
                                }];
                    }
                });
            });
        };
        SearchService_1.prototype.indexProject = function (projectId) {
            return __awaiter(this, void 0, void 0, function () {
                var project, error_4;
                var _a, _b, _c, _d, _e, _f;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            if (!this.projectIndex)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.prisma.project.findUnique({
                                    where: { id: projectId },
                                    include: {
                                        author: { select: { username: true } },
                                        category: { select: { id: true, name: true } },
                                        loaders: { select: { type: true } },
                                    },
                                })];
                        case 1:
                            project = _g.sent();
                            if (!project)
                                return [2 /*return*/];
                            _g.label = 2;
                        case 2:
                            _g.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, this.projectIndex.addDocuments([
                                    {
                                        id: project.id,
                                        title: project.title,
                                        slug: project.slug,
                                        description: project.description,
                                        body: (_a = project.body) !== null && _a !== void 0 ? _a : '',
                                        authorId: project.authorId,
                                        authorName: (_c = (_b = project.author) === null || _b === void 0 ? void 0 : _b.username) !== null && _c !== void 0 ? _c : '',
                                        categoryId: (_d = project.categoryId) !== null && _d !== void 0 ? _d : '',
                                        categoryName: (_f = (_e = project.category) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : '',
                                        loaders: project.loaders.map(function (l) { return l.type; }),
                                        downloads: project.downloads,
                                        views: project.views,
                                        status: project.status,
                                        featured: project.featured,
                                        iconUrl: project.iconUrl,
                                        createdAt: project.createdAt.getTime(),
                                        updatedAt: project.updatedAt.getTime(),
                                    },
                                ])];
                        case 3:
                            _g.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            error_4 = _g.sent();
                            this.logger.error("Failed to index project ".concat(projectId, ": ").concat(error_4.message));
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        SearchService_1.prototype.removeFromIndex = function (projectId) {
            return __awaiter(this, void 0, void 0, function () {
                var error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.projectIndex)
                                return [2 /*return*/];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.projectIndex.deleteDocument(projectId)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_5 = _a.sent();
                            this.logger.error("Failed to remove project ".concat(projectId, " from index: ").concat(error_5.message));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        SearchService_1.prototype.reindexAll = function () {
            return __awaiter(this, void 0, void 0, function () {
                var BATCH_SIZE, totalIndexed, cursor, hasMore, projects, documents;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.projectIndex) {
                                throw new Error('Search index not available');
                            }
                            BATCH_SIZE = 500;
                            totalIndexed = 0;
                            cursor = null;
                            hasMore = true;
                            _a.label = 1;
                        case 1:
                            if (!hasMore) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.prisma.project.findMany(__assign(__assign({ where: { status: 'PUBLISHED' }, take: BATCH_SIZE }, (cursor ? { skip: 1, cursor: { id: cursor } } : {})), { include: {
                                        author: { select: { username: true } },
                                        category: { select: { id: true, name: true } },
                                        loaders: { select: { type: true } },
                                    }, orderBy: { id: 'asc' } }))];
                        case 2:
                            projects = _a.sent();
                            if (projects.length === 0) {
                                hasMore = false;
                                return [3 /*break*/, 4];
                            }
                            cursor = projects[projects.length - 1].id;
                            documents = projects.map(function (p) {
                                var _a, _b, _c, _d, _e, _f;
                                return ({
                                    id: p.id,
                                    title: p.title,
                                    slug: p.slug,
                                    description: p.description,
                                    body: (_a = p.body) !== null && _a !== void 0 ? _a : '',
                                    authorId: p.authorId,
                                    authorName: (_c = (_b = p.author) === null || _b === void 0 ? void 0 : _b.username) !== null && _c !== void 0 ? _c : '',
                                    categoryId: (_d = p.categoryId) !== null && _d !== void 0 ? _d : '',
                                    categoryName: (_f = (_e = p.category) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : '',
                                    loaders: p.loaders.map(function (l) { return l.type; }),
                                    downloads: p.downloads,
                                    views: p.views,
                                    status: p.status,
                                    featured: p.featured,
                                    iconUrl: p.iconUrl,
                                    createdAt: p.createdAt.getTime(),
                                    updatedAt: p.updatedAt.getTime(),
                                });
                            });
                            return [4 /*yield*/, this.projectIndex.addDocuments(documents)];
                        case 3:
                            _a.sent();
                            totalIndexed += documents.length;
                            if (projects.length < BATCH_SIZE) {
                                hasMore = false;
                            }
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/, { count: totalIndexed }];
                    }
                });
            });
        };
        return SearchService_1;
    }());
    __setFunctionName(_classThis, "SearchService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SearchService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SearchService = _classThis;
}();
exports.SearchService = SearchService;
