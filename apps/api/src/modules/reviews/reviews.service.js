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
exports.ReviewsService = void 0;
var common_1 = require("@nestjs/common");
var ReviewsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ReviewsService = _classThis = /** @class */ (function () {
        function ReviewsService_1(prisma) {
            this.prisma = prisma;
            this.logger = new common_1.Logger(ReviewsService.name);
        }
        ReviewsService_1.prototype.create = function (dto, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var project, existing, review;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({
                                where: { id: dto.projectId },
                            })];
                        case 1:
                            project = _a.sent();
                            if (!project) {
                                throw new common_1.NotFoundException('Project not found');
                            }
                            return [4 /*yield*/, this.prisma.review.findUnique({
                                    where: { userId_projectId: { userId: userId, projectId: dto.projectId } },
                                })];
                        case 2:
                            existing = _a.sent();
                            if (existing) {
                                throw new common_1.BadRequestException('You have already reviewed this project');
                            }
                            return [4 /*yield*/, this.prisma.review.create({
                                    data: {
                                        rating: dto.rating,
                                        title: dto.title,
                                        body: dto.body,
                                        userId: userId,
                                        projectId: dto.projectId,
                                    },
                                    include: {
                                        user: { select: { id: true, username: true, avatarUrl: true } },
                                    },
                                })];
                        case 3:
                            review = _a.sent();
                            return [4 /*yield*/, this.updateProjectRating(dto.projectId)];
                        case 4:
                            _a.sent();
                            return [2 /*return*/, this.format(review)];
                    }
                });
            });
        };
        ReviewsService_1.prototype.findByProject = function (projectId_1) {
            return __awaiter(this, arguments, void 0, function (projectId, page, limit) {
                var project, skip, _a, reviews, total, stats;
                var _this = this;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({
                                where: { id: projectId },
                            })];
                        case 1:
                            project = _b.sent();
                            if (!project) {
                                throw new common_1.NotFoundException('Project not found');
                            }
                            skip = (page - 1) * limit;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.review.findMany({
                                        where: { projectId: projectId },
                                        orderBy: { createdAt: 'desc' },
                                        skip: skip,
                                        take: limit,
                                        include: {
                                            user: { select: { id: true, username: true, avatarUrl: true } },
                                        },
                                    }),
                                    this.prisma.review.count({ where: { projectId: projectId } }),
                                ])];
                        case 2:
                            _a = _b.sent(), reviews = _a[0], total = _a[1];
                            return [4 /*yield*/, this.getProjectStats(projectId)];
                        case 3:
                            stats = _b.sent();
                            return [2 /*return*/, {
                                    data: reviews.map(function (r) { return _this.format(r); }),
                                    meta: {
                                        page: page,
                                        limit: limit,
                                        total: total,
                                        totalPages: Math.ceil(total / limit),
                                        stats: stats,
                                    },
                                }];
                    }
                });
            });
        };
        ReviewsService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var review;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.review.findUnique({
                                where: { id: id },
                                include: {
                                    user: { select: { id: true, username: true, avatarUrl: true } },
                                },
                            })];
                        case 1:
                            review = _a.sent();
                            if (!review) {
                                throw new common_1.NotFoundException('Review not found');
                            }
                            return [2 /*return*/, this.format(review)];
                    }
                });
            });
        };
        ReviewsService_1.prototype.findUserReview = function (projectId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var review;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.review.findUnique({
                                where: { userId_projectId: { userId: userId, projectId: projectId } },
                                include: {
                                    user: { select: { id: true, username: true, avatarUrl: true } },
                                },
                            })];
                        case 1:
                            review = _a.sent();
                            return [2 /*return*/, review ? this.format(review) : null];
                    }
                });
            });
        };
        ReviewsService_1.prototype.update = function (id, dto, userId, userRole) {
            return __awaiter(this, void 0, void 0, function () {
                var review, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.review.findUnique({ where: { id: id } })];
                        case 1:
                            review = _a.sent();
                            if (!review) {
                                throw new common_1.NotFoundException('Review not found');
                            }
                            if (review.userId !== userId && userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
                                throw new common_1.ForbiddenException('You are not allowed to update this review');
                            }
                            return [4 /*yield*/, this.prisma.review.update({
                                    where: { id: id },
                                    data: {
                                        rating: dto.rating,
                                        title: dto.title,
                                        body: dto.body,
                                    },
                                    include: {
                                        user: { select: { id: true, username: true, avatarUrl: true } },
                                    },
                                })];
                        case 2:
                            updated = _a.sent();
                            return [4 /*yield*/, this.updateProjectRating(review.projectId)];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, this.format(updated)];
                    }
                });
            });
        };
        ReviewsService_1.prototype.remove = function (id, userId, userRole) {
            return __awaiter(this, void 0, void 0, function () {
                var review;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.review.findUnique({ where: { id: id } })];
                        case 1:
                            review = _a.sent();
                            if (!review) {
                                throw new common_1.NotFoundException('Review not found');
                            }
                            if (review.userId !== userId && userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
                                throw new common_1.ForbiddenException('You are not allowed to delete this review');
                            }
                            return [4 /*yield*/, this.prisma.review.delete({ where: { id: id } })];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.updateProjectRating(review.projectId)];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ReviewsService_1.prototype.getProjectStats = function (projectId) {
            return __awaiter(this, void 0, void 0, function () {
                var project, ratings, distribution, _i, ratings_1, r;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({
                                where: { id: projectId },
                                select: { ratingAverage: true, ratingCount: true },
                            })];
                        case 1:
                            project = _c.sent();
                            return [4 /*yield*/, this.prisma.review.findMany({
                                    where: { projectId: projectId },
                                    select: { rating: true },
                                })];
                        case 2:
                            ratings = _c.sent();
                            distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                            for (_i = 0, ratings_1 = ratings; _i < ratings_1.length; _i++) {
                                r = ratings_1[_i];
                                distribution[r.rating] = (distribution[r.rating] || 0) + 1;
                            }
                            return [2 /*return*/, {
                                    average: (_a = project === null || project === void 0 ? void 0 : project.ratingAverage) !== null && _a !== void 0 ? _a : 0,
                                    count: (_b = project === null || project === void 0 ? void 0 : project.ratingCount) !== null && _b !== void 0 ? _b : 0,
                                    distribution: distribution,
                                }];
                    }
                });
            });
        };
        ReviewsService_1.prototype.updateProjectRating = function (projectId) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.review.aggregate({
                                where: { projectId: projectId },
                                _avg: { rating: true },
                                _count: { rating: true },
                            })];
                        case 1:
                            result = _b.sent();
                            return [4 /*yield*/, this.prisma.project.update({
                                    where: { id: projectId },
                                    data: {
                                        ratingAverage: (_a = result._avg.rating) !== null && _a !== void 0 ? _a : 0,
                                        ratingCount: result._count.rating,
                                    },
                                })];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ReviewsService_1.prototype.format = function (review) {
            var _a, _b, _c;
            return {
                id: review.id,
                rating: review.rating,
                title: (_a = review.title) !== null && _a !== void 0 ? _a : undefined,
                body: (_b = review.body) !== null && _b !== void 0 ? _b : undefined,
                userId: review.userId,
                projectId: review.projectId,
                createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : review.createdAt,
                updatedAt: review.updatedAt instanceof Date ? review.updatedAt.toISOString() : review.updatedAt,
                user: review.user
                    ? {
                        id: review.user.id,
                        username: review.user.username,
                        avatarUrl: (_c = review.user.avatarUrl) !== null && _c !== void 0 ? _c : undefined,
                    }
                    : undefined,
            };
        };
        return ReviewsService_1;
    }());
    __setFunctionName(_classThis, "ReviewsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ReviewsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ReviewsService = _classThis;
}();
exports.ReviewsService = ReviewsService;
