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
exports.UserFollowsService = void 0;
var common_1 = require("@nestjs/common");
var UserFollowsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var UserFollowsService = _classThis = /** @class */ (function () {
        function UserFollowsService_1(prisma) {
            this.prisma = prisma;
            this.logger = new common_1.Logger(UserFollowsService.name);
        }
        UserFollowsService_1.prototype.followUser = function (followerId, followedId) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, follower, followed;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                this.prisma.user.findUnique({ where: { id: followerId } }),
                                this.prisma.user.findUnique({ where: { id: followedId } }),
                            ])];
                        case 1:
                            _a = _b.sent(), follower = _a[0], followed = _a[1];
                            if (!follower)
                                throw new common_1.NotFoundException('Follower user not found');
                            if (!followed)
                                throw new common_1.NotFoundException('User to follow not found');
                            // Prevent users from following themselves
                            if (followerId === followedId) {
                                throw new Error('Users cannot follow themselves');
                            }
                            return [4 /*yield*/, this.prisma.userFollow.upsert({
                                    where: { followerId_followedId: { followerId: followerId, followedId: followedId } },
                                    update: {},
                                    create: { followerId: followerId, followedId: followedId },
                                })];
                        case 2:
                            _b.sent();
                            // Create a notification for the followed user
                            return [4 /*yield*/, this.createFollowNotification(followerId, followedId)];
                        case 3:
                            // Create a notification for the followed user
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        UserFollowsService_1.prototype.unfollowUser = function (followerId, followedId) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, follower, followed;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                this.prisma.user.findUnique({ where: { id: followerId } }),
                                this.prisma.user.findUnique({ where: { id: followedId } }),
                            ])];
                        case 1:
                            _a = _b.sent(), follower = _a[0], followed = _a[1];
                            if (!follower)
                                throw new common_1.NotFoundException('Follower user not found');
                            if (!followed)
                                throw new common_1.NotFoundException('User to unfollow not found');
                            return [4 /*yield*/, this.prisma.userFollow.deleteMany({
                                    where: { followerId: followerId, followedId: followedId },
                                })];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        UserFollowsService_1.prototype.isFollowing = function (followerId, followedId) {
            return __awaiter(this, void 0, void 0, function () {
                var follow;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.userFollow.findUnique({
                                where: { followerId_followedId: { followerId: followerId, followedId: followedId } },
                            })];
                        case 1:
                            follow = _a.sent();
                            return [2 /*return*/, !!follow];
                    }
                });
            });
        };
        UserFollowsService_1.prototype.getFollowers = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, page, limit) {
                var skip, _a, followers, total;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            skip = (page - 1) * limit;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.userFollow.findMany({
                                        where: { followedId: userId },
                                        skip: skip,
                                        take: limit,
                                        orderBy: { createdAt: 'desc' },
                                        include: {
                                            follower: { select: { id: true, username: true, avatarUrl: true, displayName: true } },
                                        },
                                    }),
                                    this.prisma.userFollow.count({ where: { followedId: userId } }),
                                ])];
                        case 1:
                            _a = _b.sent(), followers = _a[0], total = _a[1];
                            return [2 /*return*/, {
                                    data: followers.map(function (f) {
                                        var _a;
                                        return ({
                                            id: f.follower.id,
                                            username: f.follower.username,
                                            displayName: f.follower.displayName,
                                            avatarUrl: (_a = f.follower.avatarUrl) !== null && _a !== void 0 ? _a : undefined,
                                            followedAt: f.createdAt.toISOString(),
                                        });
                                    }),
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
        UserFollowsService_1.prototype.getFollowing = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, page, limit) {
                var skip, _a, following, total;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            skip = (page - 1) * limit;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.userFollow.findMany({
                                        where: { followerId: userId },
                                        skip: skip,
                                        take: limit,
                                        orderBy: { createdAt: 'desc' },
                                        include: {
                                            followed: { select: { id: true, username: true, avatarUrl: true, displayName: true } },
                                        },
                                    }),
                                    this.prisma.userFollow.count({ where: { followerId: userId } }),
                                ])];
                        case 1:
                            _a = _b.sent(), following = _a[0], total = _a[1];
                            return [2 /*return*/, {
                                    data: following.map(function (f) {
                                        var _a;
                                        return ({
                                            id: f.followed.id,
                                            username: f.followed.username,
                                            displayName: f.followed.displayName,
                                            avatarUrl: (_a = f.followed.avatarUrl) !== null && _a !== void 0 ? _a : undefined,
                                            followedAt: f.createdAt.toISOString(),
                                        });
                                    }),
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
        UserFollowsService_1.prototype.getFollowerCount = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.userFollow.count({ where: { followedId: userId } })];
                });
            });
        };
        UserFollowsService_1.prototype.getFollowingCount = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.userFollow.count({ where: { followerId: userId } })];
                });
            });
        };
        UserFollowsService_1.prototype.createFollowNotification = function (followerId, followedId) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, follower, followed;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                this.prisma.user.findUnique({ where: { id: followerId }, select: { username: true, displayName: true } }),
                                this.prisma.user.findUnique({ where: { id: followedId }, select: { id: true } }),
                            ])];
                        case 1:
                            _a = _b.sent(), follower = _a[0], followed = _a[1];
                            if (!follower || !followed)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.prisma.notification.create({
                                    data: {
                                        userId: followedId,
                                        type: 'FOLLOW',
                                        title: 'New follower',
                                        body: "".concat(follower.displayName || follower.username, " started following you"),
                                        // No projectId since this is a user-to-user notification
                                    },
                                })];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return UserFollowsService_1;
    }());
    __setFunctionName(_classThis, "UserFollowsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UserFollowsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UserFollowsService = _classThis;
}();
exports.UserFollowsService = UserFollowsService;
