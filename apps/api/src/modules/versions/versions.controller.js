"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
exports.VersionByIdController = exports.VersionsController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
var scopes_guard_1 = require("../../common/guards/scopes.guard");
var scopes_decorator_1 = require("../../common/decorators/scopes.decorator");
var public_decorator_1 = require("../../common/decorators/public.decorator");
var client_1 = require("@prisma/client");
var VersionsController = function () {
    var _classDecorators = [(0, common_1.Controller)('projects/:projectId/versions')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _create_decorators;
    var _findAll_decorators;
    var VersionsController = _classThis = /** @class */ (function () {
        function VersionsController_1(versionsService, projectsService, prisma) {
            this.versionsService = (__runInitializers(this, _instanceExtraInitializers), versionsService);
            this.projectsService = projectsService;
            this.prisma = prisma;
        }
        VersionsController_1.prototype.create = function (projectIdOrSlug, dto, userId, userRole) {
            return __awaiter(this, void 0, void 0, function () {
                var project, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.projectsService.findProjectOr404(projectIdOrSlug)];
                        case 1:
                            project = _a.sent();
                            return [4 /*yield*/, this.verifyProjectOwnership(project.id, { id: userId, role: userRole })];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.versionsService.create(project.id, dto)];
                        case 3:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.CREATED,
                                    message: 'Version created successfully',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        VersionsController_1.prototype.findAll = function (projectIdOrSlug, pagination) {
            return __awaiter(this, void 0, void 0, function () {
                var page;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.versionsService.findAllByProjectCursor(projectIdOrSlug, {
                                cursor: pagination.cursor,
                                limit: pagination.limit,
                            })];
                        case 1:
                            page = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Versions retrieved successfully',
                                    data: page.data,
                                    meta: { nextCursor: page.nextCursor, hasMore: page.hasMore },
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        VersionsController_1.prototype.verifyProjectOwnership = function (projectId, user) {
            return __awaiter(this, void 0, void 0, function () {
                var project;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({
                                where: { id: projectId },
                                select: { authorId: true },
                            })];
                        case 1:
                            project = _a.sent();
                            if (!project) {
                                throw new common_1.ForbiddenException('Project not found');
                            }
                            if (project.authorId !== user.id && !['ADMIN', 'OWNER', 'MODERATOR'].includes(user.role)) {
                                throw new common_1.ForbiddenException('You can only modify versions on your own projects');
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        return VersionsController_1;
    }());
    __setFunctionName(_classThis, "VersionsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [(0, common_1.Post)(), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, scopes_guard_1.ScopesGuard), (0, scopes_decorator_1.Scopes)(client_1.ApiKeyScope.VERSION_WRITE, client_1.ApiKeyScope.PROJECT_WRITE), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED)];
        _findAll_decorators = [(0, common_1.Get)(), (0, public_decorator_1.Public)(), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        VersionsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return VersionsController = _classThis;
}();
exports.VersionsController = VersionsController;
var VersionByIdController = function () {
    var _classDecorators = [(0, common_1.Controller)('versions')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _list_decorators;
    var _findOne_decorators;
    var _update_decorators;
    var _remove_decorators;
    var _download_decorators;
    var VersionByIdController = _classThis = /** @class */ (function () {
        function VersionByIdController_1(versionsService, prisma) {
            this.versionsService = (__runInitializers(this, _instanceExtraInitializers), versionsService);
            this.prisma = prisma;
        }
        VersionByIdController_1.prototype.list = function (ids) {
            return __awaiter(this, void 0, void 0, function () {
                var parsed, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!ids) return [3 /*break*/, 2];
                            parsed = ids.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
                            return [4 /*yield*/, this.versionsService.findByIds(parsed)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Versions retrieved successfully',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                        case 2: 
                        // No filter: return empty rather than 404; clients use ?ids= for bulk.
                        return [2 /*return*/, {
                                statusCode: common_1.HttpStatus.OK,
                                message: 'Provide ?ids=A,B,C to fetch specific versions',
                                data: [],
                                timestamp: new Date().toISOString(),
                            }];
                    }
                });
            });
        };
        VersionByIdController_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.versionsService.findOne(id)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Version retrieved successfully',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        VersionByIdController_1.prototype.update = function (id, dto, userId, userRole) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.verifyVersionOwnership(id, { id: userId, role: userRole })];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.versionsService.update(id, dto)];
                        case 2:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Version updated successfully',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        VersionByIdController_1.prototype.remove = function (id, userId, userRole) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.verifyVersionOwnership(id, { id: userId, role: userRole })];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.versionsService.remove(id)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Version deleted successfully',
                                    data: null,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        VersionByIdController_1.prototype.download = function (id, req) {
            return __awaiter(this, void 0, void 0, function () {
                var ip, userAgent, userId, _a, fileUrl, hash;
                var _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            ip = (_b = req.headers['x-forwarded-for']) !== null && _b !== void 0 ? _b : req.ip;
                            userAgent = req.headers['user-agent'];
                            userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
                            return [4 /*yield*/, this.versionsService.incrementDownloads(id, ip, userAgent, userId)];
                        case 1:
                            _a = _d.sent(), fileUrl = _a.fileUrl, hash = _a.hash;
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Download URL retrieved successfully',
                                    data: { url: fileUrl, hash: hash, hashAlgorithm: 'sha256' },
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        VersionByIdController_1.prototype.verifyVersionOwnership = function (versionId, user) {
            return __awaiter(this, void 0, void 0, function () {
                var version, project;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.projectVersion.findUnique({
                                where: { id: versionId },
                                select: { projectId: true },
                            })];
                        case 1:
                            version = _a.sent();
                            if (!version) {
                                throw new common_1.ForbiddenException('Version not found');
                            }
                            return [4 /*yield*/, this.prisma.project.findUnique({
                                    where: { id: version.projectId },
                                    select: { authorId: true },
                                })];
                        case 2:
                            project = _a.sent();
                            if (!project || (project.authorId !== user.id && !['ADMIN', 'OWNER', 'MODERATOR'].includes(user.role))) {
                                throw new common_1.ForbiddenException('You can only modify versions on your own projects');
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        return VersionByIdController_1;
    }());
    __setFunctionName(_classThis, "VersionByIdController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _list_decorators = [(0, common_1.Get)(), (0, public_decorator_1.Public)(), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _findOne_decorators = [(0, common_1.Get)(':id'), (0, public_decorator_1.Public)(), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _update_decorators = [(0, common_1.Patch)(':id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, scopes_guard_1.ScopesGuard), (0, scopes_decorator_1.Scopes)(client_1.ApiKeyScope.VERSION_WRITE, client_1.ApiKeyScope.PROJECT_WRITE)];
        _remove_decorators = [(0, common_1.Delete)(':id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, scopes_guard_1.ScopesGuard), (0, scopes_decorator_1.Scopes)(client_1.ApiKeyScope.VERSION_WRITE, client_1.ApiKeyScope.DELETE), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _download_decorators = [(0, common_1.Get)(':id/download'), (0, public_decorator_1.Public)()];
        __esDecorate(_classThis, null, _list_decorators, { kind: "method", name: "list", static: false, private: false, access: { has: function (obj) { return "list" in obj; }, get: function (obj) { return obj.list; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: function (obj) { return "update" in obj; }, get: function (obj) { return obj.update; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: function (obj) { return "remove" in obj; }, get: function (obj) { return obj.remove; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _download_decorators, { kind: "method", name: "download", static: false, private: false, access: { has: function (obj) { return "download" in obj; }, get: function (obj) { return obj.download; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        VersionByIdController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return VersionByIdController = _classThis;
}();
exports.VersionByIdController = VersionByIdController;
