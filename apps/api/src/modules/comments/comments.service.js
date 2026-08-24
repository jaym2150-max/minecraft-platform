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
exports.CommentsService = void 0;
var common_1 = require("@nestjs/common");
var CommentsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var CommentsService = _classThis = /** @class */ (function () {
        function CommentsService_1(prisma) {
            this.prisma = prisma;
            this.logger = new common_1.Logger(CommentsService.name);
        }
        CommentsService_1.prototype.create = function (dto, authorId) {
            return __awaiter(this, void 0, void 0, function () {
                var project, parent_1, comment;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({ where: { id: dto.projectId } })];
                        case 1:
                            project = _a.sent();
                            if (!project) {
                                throw new common_1.NotFoundException("Project with id \"".concat(dto.projectId, "\" not found"));
                            }
                            if (!dto.parentId) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.comment.findUnique({ where: { id: dto.parentId } })];
                        case 2:
                            parent_1 = _a.sent();
                            if (!parent_1) {
                                throw new common_1.NotFoundException("Parent comment with id \"".concat(dto.parentId, "\" not found"));
                            }
                            if (parent_1.projectId !== dto.projectId) {
                                throw new common_1.ForbiddenException('Parent comment does not belong to this project');
                            }
                            _a.label = 3;
                        case 3: return [4 /*yield*/, this.prisma.comment.create({
                                data: {
                                    content: dto.content,
                                    authorId: authorId,
                                    projectId: dto.projectId,
                                    parentId: dto.parentId,
                                },
                                include: {
                                    author: { select: { id: true, username: true, avatarUrl: true, role: true } },
                                },
                            })];
                        case 4:
                            comment = _a.sent();
                            return [2 /*return*/, this.format(comment)];
                    }
                });
            });
        };
        CommentsService_1.prototype.findByProject = function (projectId_1) {
            return __awaiter(this, arguments, void 0, function (projectId, page, limit) {
                var project, skip, _a, comments, total;
                var _this = this;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({ where: { id: projectId } })];
                        case 1:
                            project = _b.sent();
                            if (!project) {
                                throw new common_1.NotFoundException("Project with id \"".concat(projectId, "\" not found"));
                            }
                            skip = (page - 1) * limit;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.comment.findMany({
                                        where: { projectId: projectId, parentId: null },
                                        skip: skip,
                                        take: limit,
                                        orderBy: { createdAt: 'desc' },
                                        include: {
                                            author: { select: { id: true, username: true, avatarUrl: true, role: true } },
                                            replies: {
                                                include: {
                                                    author: { select: { id: true, username: true, avatarUrl: true, role: true } },
                                                },
                                                orderBy: { createdAt: 'asc' },
                                            },
                                        },
                                    }),
                                    this.prisma.comment.count({ where: { projectId: projectId, parentId: null } }),
                                ])];
                        case 2:
                            _a = _b.sent(), comments = _a[0], total = _a[1];
                            return [2 /*return*/, {
                                    data: comments.map(function (c) { return _this.format(c); }),
                                    meta: { page: page, limit: limit, total: total, totalPages: Math.ceil(total / limit) },
                                }];
                    }
                });
            });
        };
        CommentsService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var comment;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.comment.findUnique({
                                where: { id: id },
                                include: {
                                    author: { select: { id: true, username: true, avatarUrl: true, role: true } },
                                    replies: {
                                        include: {
                                            author: { select: { id: true, username: true, avatarUrl: true, role: true } },
                                        },
                                    },
                                },
                            })];
                        case 1:
                            comment = _a.sent();
                            if (!comment) {
                                throw new common_1.NotFoundException("Comment with id \"".concat(id, "\" not found"));
                            }
                            return [2 /*return*/, this.format(comment)];
                    }
                });
            });
        };
        CommentsService_1.prototype.update = function (id, dto, userId, userRole) {
            return __awaiter(this, void 0, void 0, function () {
                var comment, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.comment.findUnique({ where: { id: id } })];
                        case 1:
                            comment = _a.sent();
                            if (!comment) {
                                throw new common_1.NotFoundException("Comment with id \"".concat(id, "\" not found"));
                            }
                            if (comment.authorId !== userId && !['MODERATOR', 'ADMIN', 'OWNER'].includes(userRole === null || userRole === void 0 ? void 0 : userRole.toUpperCase())) {
                                throw new common_1.ForbiddenException('You can only edit your own comments');
                            }
                            return [4 /*yield*/, this.prisma.comment.update({
                                    where: { id: id },
                                    data: { content: dto.content },
                                    include: {
                                        author: { select: { id: true, username: true, avatarUrl: true, role: true } },
                                    },
                                })];
                        case 2:
                            updated = _a.sent();
                            return [2 /*return*/, this.format(updated)];
                    }
                });
            });
        };
        CommentsService_1.prototype.remove = function (id, userId, userRole) {
            return __awaiter(this, void 0, void 0, function () {
                var comment;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.comment.findUnique({ where: { id: id } })];
                        case 1:
                            comment = _a.sent();
                            if (!comment) {
                                throw new common_1.NotFoundException("Comment with id \"".concat(id, "\" not found"));
                            }
                            if (comment.authorId !== userId && !['MODERATOR', 'ADMIN', 'OWNER'].includes(userRole === null || userRole === void 0 ? void 0 : userRole.toUpperCase())) {
                                throw new common_1.ForbiddenException('You can only delete your own comments');
                            }
                            return [4 /*yield*/, this.prisma.$transaction([
                                    this.prisma.comment.deleteMany({ where: { parentId: id } }),
                                    this.prisma.comment.delete({ where: { id: id } }),
                                ])];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        CommentsService_1.prototype.format = function (comment) {
            var _this = this;
            var _a, _b, _c, _d;
            return {
                id: comment.id,
                content: comment.content,
                authorId: comment.authorId,
                projectId: comment.projectId,
                parentId: (_a = comment.parentId) !== null && _a !== void 0 ? _a : undefined,
                createdAt: comment.createdAt instanceof Date ? comment.createdAt.toISOString() : comment.createdAt,
                updatedAt: comment.updatedAt instanceof Date ? comment.updatedAt.toISOString() : comment.updatedAt,
                author: comment.author
                    ? {
                        id: comment.author.id,
                        username: comment.author.username,
                        avatarUrl: (_b = comment.author.avatarUrl) !== null && _b !== void 0 ? _b : undefined,
                        role: comment.author.role,
                    }
                    : undefined,
                replies: (_d = (_c = comment.replies) === null || _c === void 0 ? void 0 : _c.map(function (r) { return _this.format(r); })) !== null && _d !== void 0 ? _d : [],
            };
        };
        return CommentsService_1;
    }());
    __setFunctionName(_classThis, "CommentsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CommentsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CommentsService = _classThis;
}();
exports.CommentsService = CommentsService;
