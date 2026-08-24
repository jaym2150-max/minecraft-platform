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
exports.NotificationsService = void 0;
var common_1 = require("@nestjs/common");
var pagination_1 = require("../../common/pagination");
var NotificationsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var NotificationsService = _classThis = /** @class */ (function () {
        function NotificationsService_1(prisma, notificationsQueue) {
            this.prisma = prisma;
            this.notificationsQueue = notificationsQueue;
            this.logger = new common_1.Logger(NotificationsService.name);
        }
        NotificationsService_1.prototype.create = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                var notification;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.notification.create({
                                data: {
                                    userId: dto.userId,
                                    type: dto.type,
                                    title: dto.title,
                                    body: dto.body,
                                },
                            })];
                        case 1:
                            notification = _a.sent();
                            return [4 /*yield*/, this.notificationsQueue.add('send-notification', {
                                    notificationId: notification.id,
                                    userId: dto.userId,
                                    type: dto.type,
                                    title: dto.title,
                                    body: dto.body,
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, this.format(notification)];
                    }
                });
            });
        };
        NotificationsService_1.prototype.findByUser = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, page, limit, unreadOnly) {
                var skip, where, _a, notifications, total, unreadCount;
                var _this = this;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                if (unreadOnly === void 0) { unreadOnly = false; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            skip = (page - 1) * limit;
                            where = __assign({ userId: userId }, (unreadOnly ? { read: false } : {}));
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.notification.findMany({
                                        where: where,
                                        skip: skip,
                                        take: limit,
                                        orderBy: { createdAt: 'desc' },
                                    }),
                                    this.prisma.notification.count({ where: where }),
                                    this.prisma.notification.count({ where: { userId: userId, read: false } }),
                                ])];
                        case 1:
                            _a = _b.sent(), notifications = _a[0], total = _a[1], unreadCount = _a[2];
                            return [2 /*return*/, {
                                    data: notifications.map(function (n) { return _this.format(n); }),
                                    meta: { page: page, limit: limit, total: total, totalPages: Math.ceil(total / limit), unreadCount: unreadCount },
                                }];
                    }
                });
            });
        };
        NotificationsService_1.prototype.findByUserCursor = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, options) {
                var _this = this;
                var _a;
                if (options === void 0) { options = {}; }
                return __generator(this, function (_b) {
                    return [2 /*return*/, (0, pagination_1.paginateCursor)({
                            take: (_a = options.limit) !== null && _a !== void 0 ? _a : 20,
                            cursor: options.cursor,
                            where: __assign({ userId: userId }, (options.unreadOnly ? { read: false } : {})),
                            orderBy: { createdAt: 'desc' },
                            prismaDelegate: {
                                findMany: function (args) { return _this.prisma.notification.findMany(args); },
                            },
                        }).then(function (page) { return (__assign(__assign({}, page), { data: page.data.map(function (n) { return _this.format(n); }) })); })];
                });
            });
        };
        NotificationsService_1.prototype.findOne = function (id, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var notification;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.notification.findUnique({ where: { id: id } })];
                        case 1:
                            notification = _a.sent();
                            if (!notification) {
                                throw new common_1.NotFoundException("Notification with id \"".concat(id, "\" not found"));
                            }
                            if (notification.userId !== userId) {
                                throw new common_1.NotFoundException("Notification with id \"".concat(id, "\" not found"));
                            }
                            return [2 /*return*/, this.format(notification)];
                    }
                });
            });
        };
        NotificationsService_1.prototype.markAsRead = function (id, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var notification, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.notification.findUnique({ where: { id: id } })];
                        case 1:
                            notification = _a.sent();
                            if (!notification || notification.userId !== userId) {
                                throw new common_1.NotFoundException("Notification with id \"".concat(id, "\" not found"));
                            }
                            return [4 /*yield*/, this.prisma.notification.update({
                                    where: { id: id },
                                    data: { read: true },
                                })];
                        case 2:
                            updated = _a.sent();
                            return [2 /*return*/, this.format(updated)];
                    }
                });
            });
        };
        NotificationsService_1.prototype.markAllAsRead = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.notification.updateMany({
                                where: { userId: userId, read: false },
                                data: { read: true },
                            })];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, { count: result.count }];
                    }
                });
            });
        };
        NotificationsService_1.prototype.remove = function (id, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var notification;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.notification.findUnique({ where: { id: id } })];
                        case 1:
                            notification = _a.sent();
                            if (!notification || notification.userId !== userId) {
                                throw new common_1.NotFoundException("Notification with id \"".concat(id, "\" not found"));
                            }
                            return [4 /*yield*/, this.prisma.notification.delete({ where: { id: id } })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        NotificationsService_1.prototype.clearAll = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.notification.deleteMany({ where: { userId: userId } })];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, { count: result.count }];
                    }
                });
            });
        };
        NotificationsService_1.prototype.format = function (n) {
            var _a;
            return {
                id: n.id,
                type: n.type,
                title: n.title,
                body: (_a = n.body) !== null && _a !== void 0 ? _a : undefined,
                read: n.read,
                userId: n.userId,
                createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
            };
        };
        return NotificationsService_1;
    }());
    __setFunctionName(_classThis, "NotificationsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotificationsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotificationsService = _classThis;
}();
exports.NotificationsService = NotificationsService;
