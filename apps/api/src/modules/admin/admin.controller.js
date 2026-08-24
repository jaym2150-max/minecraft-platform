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
exports.AdminController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
var roles_guard_1 = require("../../common/guards/roles.guard");
var roles_decorator_1 = require("../../common/decorators/roles.decorator");
var AdminController = function () {
    var _classDecorators = [(0, common_1.Controller)('admin'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('ADMIN', 'OWNER')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _listUsers_decorators;
    var _changeUserRole_decorators;
    var _changeUserTier_decorators;
    var _banUser_decorators;
    var _unbanUser_decorators;
    var _updateProjectStatus_decorators;
    var _updateProjectFeature_decorators;
    var _getAnalytics_decorators;
    var AdminController = _classThis = /** @class */ (function () {
        function AdminController_1(adminService) {
            this.adminService = (__runInitializers(this, _instanceExtraInitializers), adminService);
        }
        AdminController_1.prototype.listUsers = function () {
            return __awaiter(this, arguments, void 0, function (page, limit, search, role, banned) {
                var _a, data, meta;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.adminService.listUsers({
                                page: Number(page),
                                limit: Math.min(Number(limit), 100),
                                search: search,
                                role: role,
                                banned: banned !== undefined ? banned === 'true' : undefined,
                            })];
                        case 1:
                            _a = _b.sent(), data = _a.data, meta = _a.meta;
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Users retrieved successfully',
                                    data: data,
                                    meta: meta,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AdminController_1.prototype.changeUserRole = function (id, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.adminService.changeUserRole(id, dto.role)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'User role updated successfully',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AdminController_1.prototype.changeUserTier = function (id, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.adminService.changeUserTier(id, dto.tier)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'User creator tier updated successfully',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AdminController_1.prototype.banUser = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.adminService.banUser(id)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'User banned successfully',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AdminController_1.prototype.unbanUser = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.adminService.unbanUser(id)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'User unbanned successfully',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AdminController_1.prototype.updateProjectStatus = function (id, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.adminService.updateProjectStatus(id, dto.status)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Project status updated successfully',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AdminController_1.prototype.updateProjectFeature = function (id, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.adminService.updateProjectFeature(id, dto.featured)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Project featured status updated successfully',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AdminController_1.prototype.getAnalytics = function () {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.adminService.getAnalytics()];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Platform analytics retrieved',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        return AdminController_1;
    }());
    __setFunctionName(_classThis, "AdminController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _listUsers_decorators = [(0, common_1.Get)('users')];
        _changeUserRole_decorators = [(0, common_1.Patch)('users/:id/role'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _changeUserTier_decorators = [(0, common_1.Patch)('users/:id/tier'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _banUser_decorators = [(0, common_1.Post)('users/:id/ban'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _unbanUser_decorators = [(0, common_1.Post)('users/:id/unban'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _updateProjectStatus_decorators = [(0, common_1.Patch)('projects/:id/status'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _updateProjectFeature_decorators = [(0, common_1.Patch)('projects/:id/feature'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _getAnalytics_decorators = [(0, common_1.Get)('analytics')];
        __esDecorate(_classThis, null, _listUsers_decorators, { kind: "method", name: "listUsers", static: false, private: false, access: { has: function (obj) { return "listUsers" in obj; }, get: function (obj) { return obj.listUsers; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _changeUserRole_decorators, { kind: "method", name: "changeUserRole", static: false, private: false, access: { has: function (obj) { return "changeUserRole" in obj; }, get: function (obj) { return obj.changeUserRole; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _changeUserTier_decorators, { kind: "method", name: "changeUserTier", static: false, private: false, access: { has: function (obj) { return "changeUserTier" in obj; }, get: function (obj) { return obj.changeUserTier; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _banUser_decorators, { kind: "method", name: "banUser", static: false, private: false, access: { has: function (obj) { return "banUser" in obj; }, get: function (obj) { return obj.banUser; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _unbanUser_decorators, { kind: "method", name: "unbanUser", static: false, private: false, access: { has: function (obj) { return "unbanUser" in obj; }, get: function (obj) { return obj.unbanUser; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateProjectStatus_decorators, { kind: "method", name: "updateProjectStatus", static: false, private: false, access: { has: function (obj) { return "updateProjectStatus" in obj; }, get: function (obj) { return obj.updateProjectStatus; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateProjectFeature_decorators, { kind: "method", name: "updateProjectFeature", static: false, private: false, access: { has: function (obj) { return "updateProjectFeature" in obj; }, get: function (obj) { return obj.updateProjectFeature; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAnalytics_decorators, { kind: "method", name: "getAnalytics", static: false, private: false, access: { has: function (obj) { return "getAnalytics" in obj; }, get: function (obj) { return obj.getAnalytics; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AdminController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AdminController = _classThis;
}();
exports.AdminController = AdminController;
