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
exports.CollectionsService = void 0;
var common_1 = require("@nestjs/common");
var pagination_1 = require("../../common/pagination");
var CollectionsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var CollectionsService = _classThis = /** @class */ (function () {
        function CollectionsService_1(prisma) {
            this.prisma = prisma;
            this.logger = new common_1.Logger(CollectionsService.name);
        }
        CollectionsService_1.prototype.create = function (userId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var collection;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.collection.create({
                                data: {
                                    name: dto.name,
                                    description: dto.description,
                                    iconUrl: dto.iconUrl,
                                    isPublic: (_a = dto.isPublic) !== null && _a !== void 0 ? _a : true,
                                    userId: userId,
                                },
                            })];
                        case 1:
                            collection = _b.sent();
                            return [2 /*return*/, this.format(collection)];
                    }
                });
            });
        };
        CollectionsService_1.prototype.findAll = function (query) {
            return __awaiter(this, void 0, void 0, function () {
                var page, limit, where, _a, data, total;
                var _this = this;
                var _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            page = (_b = query.page) !== null && _b !== void 0 ? _b : 1;
                            limit = (_c = query.limit) !== null && _c !== void 0 ? _c : 20;
                            where = {};
                            if (query.userId)
                                where.userId = query.userId;
                            if (query.isPublic !== undefined)
                                where.isPublic = query.isPublic;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.collection.findMany({
                                        where: where,
                                        orderBy: { createdAt: 'desc' },
                                        skip: (page - 1) * limit,
                                        take: limit,
                                        include: {
                                            user: { select: { id: true, username: true, avatarUrl: true } },
                                            _count: { select: { projects: true } },
                                        },
                                    }),
                                    this.prisma.collection.count({ where: where }),
                                ])];
                        case 1:
                            _a = _d.sent(), data = _a[0], total = _a[1];
                            return [2 /*return*/, {
                                    data: data.map(function (c) { return (__assign(__assign({}, _this.format(c)), { projectCount: c._count.projects })); }),
                                    meta: { total: total, page: page, totalPages: Math.ceil(total / limit) },
                                }];
                    }
                });
            });
        };
        CollectionsService_1.prototype.findAllCursor = function () {
            return __awaiter(this, arguments, void 0, function (query) {
                var where;
                var _this = this;
                var _a;
                if (query === void 0) { query = {}; }
                return __generator(this, function (_b) {
                    where = {};
                    if (query.userId)
                        where.userId = query.userId;
                    if (query.isPublic !== undefined)
                        where.isPublic = query.isPublic;
                    return [2 /*return*/, (0, pagination_1.paginateCursor)({
                            take: (_a = query.limit) !== null && _a !== void 0 ? _a : 20,
                            cursor: query.cursor,
                            where: where,
                            orderBy: { createdAt: 'desc' },
                            prismaDelegate: {
                                findMany: function (args) { return _this.prisma.collection.findMany(__assign(__assign({}, args), { include: {
                                        user: { select: { id: true, username: true, avatarUrl: true } },
                                        _count: { select: { projects: true } },
                                    } })); },
                            },
                        }).then(function (page) { return (__assign(__assign({}, page), { data: page.data.map(function (c) { return (__assign(__assign({}, _this.format(c)), { projectCount: c._count.projects })); }) })); })];
                });
            });
        };
        CollectionsService_1.prototype.findOne = function (id, currentUserId) {
            return __awaiter(this, void 0, void 0, function () {
                var collection;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.collection.findUnique({
                                where: { id: id },
                                include: {
                                    user: { select: { id: true, username: true, avatarUrl: true } },
                                    projects: {
                                        orderBy: { sortOrder: 'asc' },
                                        include: {
                                            project: {
                                                select: {
                                                    id: true,
                                                    title: true,
                                                    slug: true,
                                                    description: true,
                                                    iconUrl: true,
                                                    downloads: true,
                                                    author: { select: { username: true } },
                                                },
                                            },
                                        },
                                    },
                                    _count: { select: { projects: true } },
                                },
                            })];
                        case 1:
                            collection = _a.sent();
                            if (!collection)
                                throw new common_1.NotFoundException('Collection not found');
                            if (!collection.isPublic && collection.userId !== currentUserId) {
                                throw new common_1.NotFoundException('Collection not found');
                            }
                            return [2 /*return*/, __assign(__assign({}, this.format(collection)), { projectCount: collection._count.projects, projects: collection.projects.map(function (cp) { return ({
                                        id: cp.id,
                                        notes: cp.notes,
                                        sortOrder: cp.sortOrder,
                                        addedAt: cp.createdAt.toISOString(),
                                        project: cp.project,
                                    }); }) })];
                    }
                });
            });
        };
        CollectionsService_1.prototype.update = function (id, userId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var collection, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOwned(id, userId)];
                        case 1:
                            collection = _a.sent();
                            return [4 /*yield*/, this.prisma.collection.update({
                                    where: { id: id },
                                    data: dto,
                                })];
                        case 2:
                            updated = _a.sent();
                            return [2 /*return*/, this.format(updated)];
                    }
                });
            });
        };
        CollectionsService_1.prototype.remove = function (id, userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOwned(id, userId)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.prisma.collection.delete({ where: { id: id } })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { message: 'Collection deleted' }];
                    }
                });
            });
        };
        CollectionsService_1.prototype.addProject = function (id, userId, projectId, notes) {
            return __awaiter(this, void 0, void 0, function () {
                var project, maxOrder, entry;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.findOwned(id, userId)];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, this.prisma.project.findUnique({ where: { id: projectId } })];
                        case 2:
                            project = _b.sent();
                            if (!project)
                                throw new common_1.NotFoundException('Project not found');
                            return [4 /*yield*/, this.prisma.collectionProject.aggregate({
                                    where: { collectionId: id },
                                    _max: { sortOrder: true },
                                })];
                        case 3:
                            maxOrder = _b.sent();
                            return [4 /*yield*/, this.prisma.collectionProject.create({
                                    data: {
                                        collectionId: id,
                                        projectId: projectId,
                                        notes: notes,
                                        sortOrder: ((_a = maxOrder._max.sortOrder) !== null && _a !== void 0 ? _a : -1) + 1,
                                    },
                                    include: {
                                        project: { select: { id: true, title: true, slug: true, iconUrl: true } },
                                    },
                                })];
                        case 4:
                            entry = _b.sent();
                            return [2 /*return*/, entry];
                    }
                });
            });
        };
        CollectionsService_1.prototype.removeProject = function (id, userId, projectId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOwned(id, userId)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.prisma.collectionProject.deleteMany({
                                    where: { collectionId: id, projectId: projectId },
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { message: 'Project removed from collection' }];
                    }
                });
            });
        };
        CollectionsService_1.prototype.findOwned = function (id, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var collection;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.collection.findUnique({ where: { id: id } })];
                        case 1:
                            collection = _a.sent();
                            if (!collection)
                                throw new common_1.NotFoundException('Collection not found');
                            if (collection.userId !== userId)
                                throw new common_1.ForbiddenException('Not your collection');
                            return [2 /*return*/, collection];
                    }
                });
            });
        };
        CollectionsService_1.prototype.format = function (collection) {
            var _a, _b;
            return {
                id: collection.id,
                name: collection.name,
                description: (_a = collection.description) !== null && _a !== void 0 ? _a : undefined,
                iconUrl: (_b = collection.iconUrl) !== null && _b !== void 0 ? _b : undefined,
                isPublic: collection.isPublic,
                userId: collection.userId,
                user: collection.user,
                createdAt: collection.createdAt instanceof Date ? collection.createdAt.toISOString() : collection.createdAt,
                updatedAt: collection.updatedAt instanceof Date ? collection.updatedAt.toISOString() : collection.updatedAt,
            };
        };
        return CollectionsService_1;
    }());
    __setFunctionName(_classThis, "CollectionsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CollectionsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CollectionsService = _classThis;
}();
exports.CollectionsService = CollectionsService;
