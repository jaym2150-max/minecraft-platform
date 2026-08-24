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
exports.NotificationsController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
var roles_guard_1 = require("../../common/guards/roles.guard");
var roles_decorator_1 = require("../../common/decorators/roles.decorator");
var NotificationsController = function () {
    var _classDecorators = [(0, common_1.Controller)('notifications'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findByUser_decorators;
    var _findOne_decorators;
    var _markAsRead_decorators;
    var _markAllAsRead_decorators;
    var _clearAll_decorators;
    var _remove_decorators;
    var _create_decorators;
    var NotificationsController = _classThis = /** @class */ (function () {
        function NotificationsController_1(notificationsService) {
            this.notificationsService = (__runInitializers(this, _instanceExtraInitializers), notificationsService);
        }
        NotificationsController_1.prototype.findByUser = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, page, limit, unread) {
                var _a, data, meta;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.notificationsService.findByUser(userId, Number(page), Number(limit), unread === 'true')];
                        case 1:
                            _a = _b.sent(), data = _a.data, meta = _a.meta;
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Notifications retrieved successfully',
                                    data: data,
                                    meta: meta,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        NotificationsController_1.prototype.findOne = function (id, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.notificationsService.findOne(id, userId)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Notification retrieved successfully',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        NotificationsController_1.prototype.markAsRead = function (id, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.notificationsService.markAsRead(id, userId)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Notification marked as read',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        NotificationsController_1.prototype.markAllAsRead = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.notificationsService.markAllAsRead(userId)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'All notifications marked as read',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        NotificationsController_1.prototype.clearAll = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.notificationsService.clearAll(userId)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'All notifications cleared',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        NotificationsController_1.prototype.remove = function (id, userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.notificationsService.remove(id, userId)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Notification deleted',
                                    data: null,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        NotificationsController_1.prototype.create = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.notificationsService.create(dto)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.CREATED,
                                    message: 'Notification created successfully',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        return NotificationsController_1;
    }());
    __setFunctionName(_classThis, "NotificationsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findByUser_decorators = [(0, common_1.Get)()];
        _findOne_decorators = [(0, common_1.Get)(':id')];
        _markAsRead_decorators = [(0, common_1.Post)(':id/read'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _markAllAsRead_decorators = [(0, common_1.Post)('read-all'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _clearAll_decorators = [(0, common_1.Delete)('clear-all'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _remove_decorators = [(0, common_1.Delete)(':id'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _create_decorators = [(0, common_1.Post)(), (0, common_1.UseGuards)(roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)('ADMIN', 'OWNER'), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED)];
        __esDecorate(_classThis, null, _findByUser_decorators, { kind: "method", name: "findByUser", static: false, private: false, access: { has: function (obj) { return "findByUser" in obj; }, get: function (obj) { return obj.findByUser; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _markAsRead_decorators, { kind: "method", name: "markAsRead", static: false, private: false, access: { has: function (obj) { return "markAsRead" in obj; }, get: function (obj) { return obj.markAsRead; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _markAllAsRead_decorators, { kind: "method", name: "markAllAsRead", static: false, private: false, access: { has: function (obj) { return "markAllAsRead" in obj; }, get: function (obj) { return obj.markAllAsRead; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _clearAll_decorators, { kind: "method", name: "clearAll", static: false, private: false, access: { has: function (obj) { return "clearAll" in obj; }, get: function (obj) { return obj.clearAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: function (obj) { return "remove" in obj; }, get: function (obj) { return obj.remove; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotificationsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotificationsController = _classThis;
}();
exports.NotificationsController = NotificationsController;
