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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
var public_decorator_1 = require("../../common/decorators/public.decorator");
var class_validator_1 = require("class-validator");
var BatchUsersDto = function () {
    var _a;
    var _ids_decorators;
    var _ids_initializers = [];
    var _ids_extraInitializers = [];
    return _a = /** @class */ (function () {
            function BatchUsersDto() {
                this.ids = __runInitializers(this, _ids_initializers, void 0);
                __runInitializers(this, _ids_extraInitializers);
            }
            return BatchUsersDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _ids_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.ArrayMaxSize)(200), (0, class_validator_1.IsString)({ each: true })];
            __esDecorate(null, null, _ids_decorators, { kind: "field", name: "ids", static: false, private: false, access: { has: function (obj) { return "ids" in obj; }, get: function (obj) { return obj.ids; }, set: function (obj, value) { obj.ids = value; } }, metadata: _metadata }, _ids_initializers, _ids_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
var FollowUserDto = function () {
    var _a;
    var _userId_decorators;
    var _userId_initializers = [];
    var _userId_extraInitializers = [];
    return _a = /** @class */ (function () {
            function FollowUserDto() {
                this.userId = __runInitializers(this, _userId_initializers, void 0);
                __runInitializers(this, _userId_extraInitializers);
            }
            return FollowUserDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _userId_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: function (obj) { return "userId" in obj; }, get: function (obj) { return obj.userId; }, set: function (obj, value) { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
var UsersController = function () {
    var _classDecorators = [(0, common_1.Controller)('users')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _list_decorators;
    var _batch_decorators;
    var _getMe_decorators;
    var _getSessions_decorators;
    var _getFollowing_decorators;
    var _getFollowers_decorators;
    var _getUserFollowing_decorators;
    var _getUserFollowers_decorators;
    var _getFollowingActivity_decorators;
    var _followUser_decorators;
    var _unfollowUser_decorators;
    var _saveNotificationPreferences_decorators;
    var _deleteAccount_decorators;
    var _revokeSession_decorators;
    var _revokeAllOtherSessions_decorators;
    var _findByUsername_decorators;
    var UsersController = _classThis = /** @class */ (function () {
        function UsersController_1(usersService, prisma, followsService, userFollowsService, projectsService, versionsService, reviewsService, commentsService) {
            this.usersService = (__runInitializers(this, _instanceExtraInitializers), usersService);
            this.prisma = prisma;
            this.followsService = followsService;
            this.userFollowsService = userFollowsService;
            this.projectsService = projectsService;
            this.versionsService = versionsService;
            this.reviewsService = reviewsService;
            this.commentsService = commentsService;
        }
        UsersController_1.prototype.list = function (ids) {
            return __awaiter(this, void 0, void 0, function () {
                var parsed, users, data;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!ids) {
                                return [2 /*return*/, {
                                        statusCode: common_1.HttpStatus.BAD_REQUEST,
                                        message: 'Query parameter "ids" is required (comma-separated)',
                                        data: null,
                                        timestamp: new Date().toISOString(),
                                    }];
                            }
                            parsed = ids.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
                            return [4 /*yield*/, this.prisma.user.findMany({
                                    where: { id: { in: parsed } },
                                    select: {
                                        id: true,
                                        username: true,
                                        displayName: true,
                                        avatarUrl: true,
                                        bio: true,
                                        role: true,
                                        createdAt: true,
                                    },
                                })];
                        case 1:
                            users = _a.sent();
                            data = users.map(function (u) { return _this.usersService.toPublicProfile(u); });
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Users retrieved successfully',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        UsersController_1.prototype.batch = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                var users, data;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findMany({
                                where: { id: { in: dto.ids } },
                                select: {
                                    id: true,
                                    username: true,
                                    displayName: true,
                                    avatarUrl: true,
                                    bio: true,
                                    role: true,
                                    createdAt: true,
                                },
                            })];
                        case 1:
                            users = _a.sent();
                            data = users.map(function (u) { return _this.usersService.toPublicProfile(u); });
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Users retrieved successfully',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        UsersController_1.prototype.getMe = function (user) {
            return __awaiter(this, void 0, void 0, function () {
                var passwordHash, safeUser;
                return __generator(this, function (_a) {
                    passwordHash = user.passwordHash, safeUser = __rest(user, ["passwordHash"]);
                    return [2 /*return*/, {
                            statusCode: common_1.HttpStatus.OK,
                            message: 'User retrieved successfully',
                            data: safeUser,
                            timestamp: new Date().toISOString(),
                        }];
                });
            });
        };
        UsersController_1.prototype.getSessions = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var sessions;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.session.findMany({
                                where: { userId: userId, expiresAt: { gte: new Date() } },
                                orderBy: { lastActiveAt: 'desc' },
                            })];
                        case 1:
                            sessions = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Sessions retrieved successfully',
                                    data: sessions,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        UsersController_1.prototype.getFollowing = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, page, limit) {
                var _a, data, meta;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.followsService.getFollowing(userId, Number(page), Number(limit))];
                        case 1:
                            _a = _b.sent(), data = _a.data, meta = _a.meta;
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Following list retrieved successfully',
                                    data: data,
                                    meta: meta,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        UsersController_1.prototype.getFollowers = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, page, limit) {
                var _a, data, meta;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.followsService.getFollowers(userId, Number(page), Number(limit))];
                        case 1:
                            _a = _b.sent(), data = _a.data, meta = _a.meta;
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Followers list retrieved successfully',
                                    data: data,
                                    meta: meta,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        UsersController_1.prototype.getUserFollowing = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, page, limit) {
                var _a, data, meta;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.userFollowsService.getFollowing(userId, Number(page), Number(limit))];
                        case 1:
                            _a = _b.sent(), data = _a.data, meta = _a.meta;
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'User following list retrieved successfully',
                                    data: data,
                                    meta: meta,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        UsersController_1.prototype.getUserFollowers = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, page, limit) {
                var _a, data, meta;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.userFollowsService.getFollowers(userId, Number(page), Number(limit))];
                        case 1:
                            _a = _b.sent(), data = _a.data, meta = _a.meta;
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'User followers list retrieved successfully',
                                    data: data,
                                    meta: meta,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        UsersController_1.prototype.getFollowingActivity = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, page, limit) {
                var followingUsers, followedUserIds, skip, _a, projects, versions, reviews, comments, getDisplayName, activityItems, total, paginatedActivities, formattedActivities;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.userFollowsService.getFollowing(userId, 1, // Get all followed users (we'll handle pagination differently for activities)
                            1000)];
                        case 1:
                            followingUsers = (_b.sent()).data;
                            followedUserIds = followingUsers.map(function (user) { return user.id; });
                            // If user isn't following anyone, return empty activity feed
                            if (followedUserIds.length === 0) {
                                return [2 /*return*/, {
                                        statusCode: common_1.HttpStatus.OK,
                                        message: 'Following activity retrieved successfully',
                                        data: [],
                                        meta: {
                                            page: page,
                                            limit: limit,
                                            total: 0,
                                            totalPages: 0,
                                        },
                                        timestamp: new Date().toISOString(),
                                    }];
                            }
                            skip = (page - 1) * limit;
                            return [4 /*yield*/, Promise.all([
                                    // Get projects created by followed users
                                    this.prisma.project.findMany({
                                        where: {
                                            authorId: { in: followedUserIds },
                                        },
                                        select: {
                                            id: true,
                                            title: true,
                                            slug: true,
                                            createdAt: true,
                                            author: {
                                                select: {
                                                    id: true,
                                                    username: true,
                                                    displayName: true,
                                                    avatarUrl: true,
                                                }
                                            }
                                        },
                                        orderBy: {
                                            createdAt: 'desc'
                                        },
                                        take: 50
                                    }),
                                    // Get versions published by followed users (through their projects)
                                    this.prisma.projectVersion.findMany({
                                        where: {
                                            project: {
                                                authorId: { in: followedUserIds }
                                            },
                                            status: 'APPROVED' // Only show approved/public versions
                                        },
                                        select: {
                                            id: true,
                                            version: true,
                                            createdAt: true,
                                            project: {
                                                select: {
                                                    id: true,
                                                    title: true,
                                                    slug: true,
                                                    author: {
                                                        select: {
                                                            id: true,
                                                            username: true,
                                                            displayName: true,
                                                            avatarUrl: true,
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        orderBy: {
                                            createdAt: 'desc'
                                        },
                                        take: 50
                                    }),
                                    // Get reviews written by followed users
                                    this.prisma.review.findMany({
                                        where: {
                                            userId: { in: followedUserIds }
                                        },
                                        select: {
                                            id: true,
                                            rating: true,
                                            title: true,
                                            body: true,
                                            createdAt: true,
                                            user: {
                                                select: {
                                                    id: true,
                                                    username: true,
                                                    displayName: true,
                                                    avatarUrl: true,
                                                }
                                            },
                                            project: {
                                                select: {
                                                    id: true,
                                                    title: true,
                                                    slug: true,
                                                }
                                            }
                                        },
                                        orderBy: {
                                            createdAt: 'desc'
                                        },
                                        take: 50
                                    }),
                                    // Get comments made by followed users
                                    this.prisma.comment.findMany({
                                        where: {
                                            authorId: { in: followedUserIds }
                                        },
                                        select: {
                                            id: true,
                                            content: true,
                                            createdAt: true,
                                            author: {
                                                select: {
                                                    id: true,
                                                    username: true,
                                                    displayName: true,
                                                    avatarUrl: true,
                                                }
                                            },
                                            project: {
                                                select: {
                                                    id: true,
                                                    title: true,
                                                    slug: true,
                                                }
                                            }
                                        },
                                        orderBy: {
                                            createdAt: 'desc'
                                        },
                                        take: 50
                                    })
                                ])];
                        case 2:
                            _a = _b.sent(), projects = _a[0], versions = _a[1], reviews = _a[2], comments = _a[3];
                            getDisplayName = function (username, displayName) {
                                return displayName || username;
                            };
                            activityItems = [];
                            // Process projects (creation)
                            projects.forEach(function (project) {
                                activityItems.push({
                                    id: "project_".concat(project.id),
                                    type: 'create',
                                    userId: project.author.id,
                                    username: project.author.username,
                                    displayName: project.author.displayName,
                                    avatarUrl: project.author.avatarUrl,
                                    projectId: project.id,
                                    projectTitle: project.title,
                                    projectSlug: project.slug,
                                    description: "created a new project: ".concat(project.title),
                                    createdAt: project.createdAt,
                                });
                            });
                            // Process versions (releases)
                            versions.forEach(function (version) {
                                activityItems.push({
                                    id: "version_".concat(version.id),
                                    type: 'release',
                                    userId: version.project.author.id,
                                    username: version.project.author.username,
                                    displayName: version.project.author.displayName,
                                    avatarUrl: version.project.author.avatarUrl,
                                    projectId: version.project.id,
                                    projectTitle: version.project.title,
                                    projectSlug: version.project.slug,
                                    versionNumber: version.version,
                                    description: "released version ".concat(version.version, " of ").concat(version.project.title),
                                    createdAt: version.createdAt,
                                });
                            });
                            // Process reviews
                            reviews.forEach(function (review) {
                                activityItems.push({
                                    id: "review_".concat(review.id),
                                    type: 'review',
                                    userId: review.user.id,
                                    username: review.user.username,
                                    displayName: review.user.displayName,
                                    avatarUrl: review.user.avatarUrl,
                                    projectId: review.project.id,
                                    projectTitle: review.project.title,
                                    projectSlug: review.project.slug,
                                    rating: review.rating,
                                    description: "reviewed ".concat(review.project.title, " with ").concat(review.rating, "/5 stars"),
                                    createdAt: review.createdAt,
                                });
                            });
                            // Process comments
                            comments.forEach(function (comment) {
                                activityItems.push({
                                    id: "comment_".concat(comment.id),
                                    type: 'comment',
                                    userId: comment.author.id,
                                    username: comment.author.username,
                                    displayName: comment.author.displayName,
                                    avatarUrl: comment.author.avatarUrl,
                                    projectId: comment.project.id,
                                    projectTitle: comment.project.title,
                                    projectSlug: comment.project.slug,
                                    description: comment.content.length > 100
                                        ? comment.content.substring(0, 97) + '...'
                                        : comment.content,
                                    createdAt: comment.createdAt,
                                });
                            });
                            // Sort all activities by date (most recent first)
                            activityItems.sort(function (a, b) {
                                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                            });
                            total = activityItems.length;
                            paginatedActivities = activityItems.slice(skip, skip + limit);
                            formattedActivities = paginatedActivities.map(function (activity) { return ({
                                id: activity.id,
                                type: activity.type,
                                description: "".concat(getDisplayName(activity.username, activity.displayName), " ").concat(activity.description),
                                // For compatibility with potential frontend components, include timestamp
                                createdAt: new Date(activity.createdAt).toISOString(),
                                // Additional metadata for richer UI if needed
                                metadata: __assign(__assign({ user: {
                                        id: activity.userId,
                                        username: activity.username,
                                        displayName: activity.displayName,
                                        avatarUrl: activity.avatarUrl,
                                    }, project: {
                                        id: activity.projectId,
                                        title: activity.projectTitle,
                                        slug: activity.projectSlug,
                                    } }, (activity.type === 'release' && { version: activity.versionNumber })), (activity.type === 'review' && { rating: activity.rating }))
                            }); });
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Following activity retrieved successfully',
                                    data: formattedActivities,
                                    meta: {
                                        page: page,
                                        limit: limit,
                                        total: total,
                                        totalPages: Math.ceil(total / limit),
                                    },
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        UsersController_1.prototype.followUser = function (followerId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.userFollowsService.followUser(followerId, dto.userId)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'User followed successfully',
                                    data: null,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        UsersController_1.prototype.unfollowUser = function (followerId, followedId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.userFollowsService.unfollowUser(followerId, followedId)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'User unfollowed successfully',
                                    data: null,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        UsersController_1.prototype.saveNotificationPreferences = function (userId, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, {
                            statusCode: common_1.HttpStatus.OK,
                            message: 'Notification preferences saved',
                            data: body.preferences,
                            timestamp: new Date().toISOString(),
                        }];
                });
            });
        };
        UsersController_1.prototype.deleteAccount = function (userId, body) {
            return __awaiter(this, void 0, void 0, function () {
                var storedHash, isValid, _a;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!body.password) {
                                throw new common_1.BadRequestException('Password is required to delete account');
                            }
                            return [4 /*yield*/, this.usersService.getPasswordHash(userId)];
                        case 1:
                            storedHash = _b.sent();
                            if (!storedHash) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.usersService.comparePassword(body.password, storedHash)];
                        case 2:
                            _a = _b.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            _a = false;
                            _b.label = 4;
                        case 4:
                            isValid = _a;
                            if (!isValid) {
                                throw new common_1.UnauthorizedException('Password is incorrect');
                            }
                            // Hard-delete the user and all dependent records in a single transaction.
                            // Previously this re-assigned orphaned comments to a non-existent
                            // "DELETED_USER_ID" placeholder that had no User row — a guaranteed FK
                            // violation that crashed deletion for anyone who had ever commented.
                            //
                            // Relations without an onDelete rule that reference users:
                            //   - Comment.authorId     -> user's own comments are deleted
                            //   - Report.reporterId    -> reports they filed are deleted
                            //   - Report.reportedId    -> reports against them are nullified
                            //   - Project.authorId     -> their projects (and cascades) are deleted
                            // Session/TwoFactor/Notification/PasswordResetToken already cascade.
                            return [4 /*yield*/, this.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                    var userCommentIds, userProjects, projectIds;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, tx.comment.findMany({
                                                    where: { authorId: userId },
                                                    select: { id: true },
                                                })];
                                            case 1:
                                                userCommentIds = _a.sent();
                                                if (!userCommentIds.length) return [3 /*break*/, 4];
                                                // Detach any replies pointing at the user's comments.
                                                return [4 /*yield*/, tx.comment.updateMany({
                                                        where: { parentId: { in: userCommentIds.map(function (c) { return c.id; }) } },
                                                        data: { parentId: null },
                                                    })];
                                            case 2:
                                                // Detach any replies pointing at the user's comments.
                                                _a.sent();
                                                return [4 /*yield*/, tx.comment.deleteMany({ where: { authorId: userId } })];
                                            case 3:
                                                _a.sent();
                                                _a.label = 4;
                                            case 4: 
                                            // 2. Reports: delete ones they filed and ones filed against them.
                                            //    reportedId/reporterId are non-nullable FKs, so we remove the
                                            //    report rows rather than attempting to null out the references.
                                            return [4 /*yield*/, tx.report.deleteMany({
                                                    where: { OR: [{ reporterId: userId }, { reportedId: userId }] },
                                                })];
                                            case 5:
                                                // 2. Reports: delete ones they filed and ones filed against them.
                                                //    reportedId/reporterId are non-nullable FKs, so we remove the
                                                //    report rows rather than attempting to null out the references.
                                                _a.sent();
                                                return [4 /*yield*/, tx.project.findMany({
                                                        where: { authorId: userId },
                                                        select: { id: true },
                                                    })];
                                            case 6:
                                                userProjects = _a.sent();
                                                if (!userProjects.length) return [3 /*break*/, 15];
                                                projectIds = userProjects.map(function (p) { return p.id; });
                                                return [4 /*yield*/, tx.loader.deleteMany({ where: { projectId: { in: projectIds } } })];
                                            case 7:
                                                _a.sent();
                                                return [4 /*yield*/, tx.dependency.deleteMany({
                                                        where: { OR: [{ dependentId: { in: projectIds } }, { requiredId: { in: projectIds } }] },
                                                    })];
                                            case 8:
                                                _a.sent();
                                                return [4 /*yield*/, tx.projectVersion.deleteMany({ where: { projectId: { in: projectIds } } })];
                                            case 9:
                                                _a.sent();
                                                return [4 /*yield*/, tx.comment.deleteMany({ where: { projectId: { in: projectIds } } })];
                                            case 10:
                                                _a.sent();
                                                return [4 /*yield*/, tx.teamMember.deleteMany({ where: { projectId: { in: projectIds } } })];
                                            case 11:
                                                _a.sent();
                                                return [4 /*yield*/, tx.team.deleteMany({ where: { projectId: { in: projectIds } } })];
                                            case 12:
                                                _a.sent();
                                                return [4 /*yield*/, tx.download.deleteMany({ where: { projectId: { in: projectIds } } })];
                                            case 13:
                                                _a.sent();
                                                return [4 /*yield*/, tx.project.deleteMany({ where: { id: { in: projectIds } } })];
                                            case 14:
                                                _a.sent();
                                                _a.label = 15;
                                            case 15: 
                                            // 4. Team memberships.
                                            return [4 /*yield*/, tx.teamMember.deleteMany({ where: { userId: userId } })];
                                            case 16:
                                                // 4. Team memberships.
                                                _a.sent();
                                                // 5. Finally the user record. Cascading relations (Session,
                                                //    TwoFactorSecret, Notification, PasswordResetToken) follow.
                                                return [4 /*yield*/, tx.user.delete({ where: { id: userId } })];
                                            case 17:
                                                // 5. Finally the user record. Cascading relations (Session,
                                                //    TwoFactorSecret, Notification, PasswordResetToken) follow.
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        case 5:
                            // Hard-delete the user and all dependent records in a single transaction.
                            // Previously this re-assigned orphaned comments to a non-existent
                            // "DELETED_USER_ID" placeholder that had no User row — a guaranteed FK
                            // violation that crashed deletion for anyone who had ever commented.
                            //
                            // Relations without an onDelete rule that reference users:
                            //   - Comment.authorId     -> user's own comments are deleted
                            //   - Report.reporterId    -> reports they filed are deleted
                            //   - Report.reportedId    -> reports against them are nullified
                            //   - Project.authorId     -> their projects (and cascades) are deleted
                            // Session/TwoFactor/Notification/PasswordResetToken already cascade.
                            _b.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Account deleted successfully',
                                    data: null,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        UsersController_1.prototype.revokeSession = function (userId, sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.session.deleteMany({
                                where: { id: sessionId, userId: userId },
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Session revoked successfully',
                                    data: null,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        UsersController_1.prototype.revokeAllOtherSessions = function (userId, body) {
            return __awaiter(this, void 0, void 0, function () {
                var where;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            where = { userId: userId };
                            if (body.currentSessionId) {
                                where.id = { not: body.currentSessionId };
                            }
                            return [4 /*yield*/, this.prisma.session.deleteMany({ where: where })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'All other sessions revoked',
                                    data: null,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        UsersController_1.prototype.findByUsername = function (username) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.usersService.findOneByUsername(username)];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                return [2 /*return*/, {
                                        statusCode: common_1.HttpStatus.NOT_FOUND,
                                        message: 'User not found',
                                        data: null,
                                        timestamp: new Date().toISOString(),
                                    }];
                            }
                            // Public, unauthenticated endpoint: return only a safe profile with no
                            // email, emailVerified flag, or timestamps (see toPublicProfile).
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'User retrieved successfully',
                                    data: this.usersService.toPublicProfile(user),
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        return UsersController_1;
    }());
    __setFunctionName(_classThis, "UsersController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _list_decorators = [(0, common_1.Get)(), (0, public_decorator_1.Public)(), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _batch_decorators = [(0, common_1.Post)('batch'), (0, public_decorator_1.Public)(), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _getMe_decorators = [(0, common_1.Get)('me'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getSessions_decorators = [(0, common_1.Get)('me/sessions'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getFollowing_decorators = [(0, common_1.Get)('me/following'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _getFollowers_decorators = [(0, common_1.Get)('me/followers'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _getUserFollowing_decorators = [(0, common_1.Get)('me/user-following'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _getUserFollowers_decorators = [(0, common_1.Get)('me/user-followers'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _getFollowingActivity_decorators = [(0, common_1.Get)('me/following/activity'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _followUser_decorators = [(0, common_1.Post)('me/follow'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _unfollowUser_decorators = [(0, common_1.Delete)('me/unfollow/:userId'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _saveNotificationPreferences_decorators = [(0, common_1.Post)('me/notification-preferences'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _deleteAccount_decorators = [(0, common_1.Post)('me/delete'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _revokeSession_decorators = [(0, common_1.Delete)('me/sessions/:sessionId'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _revokeAllOtherSessions_decorators = [(0, common_1.Post)('me/sessions/revoke-all'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _findByUsername_decorators = [(0, common_1.Get)(':username'), (0, public_decorator_1.Public)()];
        __esDecorate(_classThis, null, _list_decorators, { kind: "method", name: "list", static: false, private: false, access: { has: function (obj) { return "list" in obj; }, get: function (obj) { return obj.list; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _batch_decorators, { kind: "method", name: "batch", static: false, private: false, access: { has: function (obj) { return "batch" in obj; }, get: function (obj) { return obj.batch; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMe_decorators, { kind: "method", name: "getMe", static: false, private: false, access: { has: function (obj) { return "getMe" in obj; }, get: function (obj) { return obj.getMe; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSessions_decorators, { kind: "method", name: "getSessions", static: false, private: false, access: { has: function (obj) { return "getSessions" in obj; }, get: function (obj) { return obj.getSessions; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getFollowing_decorators, { kind: "method", name: "getFollowing", static: false, private: false, access: { has: function (obj) { return "getFollowing" in obj; }, get: function (obj) { return obj.getFollowing; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getFollowers_decorators, { kind: "method", name: "getFollowers", static: false, private: false, access: { has: function (obj) { return "getFollowers" in obj; }, get: function (obj) { return obj.getFollowers; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUserFollowing_decorators, { kind: "method", name: "getUserFollowing", static: false, private: false, access: { has: function (obj) { return "getUserFollowing" in obj; }, get: function (obj) { return obj.getUserFollowing; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUserFollowers_decorators, { kind: "method", name: "getUserFollowers", static: false, private: false, access: { has: function (obj) { return "getUserFollowers" in obj; }, get: function (obj) { return obj.getUserFollowers; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getFollowingActivity_decorators, { kind: "method", name: "getFollowingActivity", static: false, private: false, access: { has: function (obj) { return "getFollowingActivity" in obj; }, get: function (obj) { return obj.getFollowingActivity; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _followUser_decorators, { kind: "method", name: "followUser", static: false, private: false, access: { has: function (obj) { return "followUser" in obj; }, get: function (obj) { return obj.followUser; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _unfollowUser_decorators, { kind: "method", name: "unfollowUser", static: false, private: false, access: { has: function (obj) { return "unfollowUser" in obj; }, get: function (obj) { return obj.unfollowUser; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _saveNotificationPreferences_decorators, { kind: "method", name: "saveNotificationPreferences", static: false, private: false, access: { has: function (obj) { return "saveNotificationPreferences" in obj; }, get: function (obj) { return obj.saveNotificationPreferences; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteAccount_decorators, { kind: "method", name: "deleteAccount", static: false, private: false, access: { has: function (obj) { return "deleteAccount" in obj; }, get: function (obj) { return obj.deleteAccount; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _revokeSession_decorators, { kind: "method", name: "revokeSession", static: false, private: false, access: { has: function (obj) { return "revokeSession" in obj; }, get: function (obj) { return obj.revokeSession; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _revokeAllOtherSessions_decorators, { kind: "method", name: "revokeAllOtherSessions", static: false, private: false, access: { has: function (obj) { return "revokeAllOtherSessions" in obj; }, get: function (obj) { return obj.revokeAllOtherSessions; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByUsername_decorators, { kind: "method", name: "findByUsername", static: false, private: false, access: { has: function (obj) { return "findByUsername" in obj; }, get: function (obj) { return obj.findByUsername; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UsersController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UsersController = _classThis;
}();
exports.UsersController = UsersController;
