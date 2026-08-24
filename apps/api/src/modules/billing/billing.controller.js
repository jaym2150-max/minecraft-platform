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
exports.BillingController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
var public_decorator_1 = require("../../common/decorators/public.decorator");
var BillingController = function () {
    var _classDecorators = [(0, common_1.Controller)('billing')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getPlans_decorators;
    var _createCheckout_decorators;
    var _createPortal_decorators;
    var _getSubscription_decorators;
    var _getBillingHistory_decorators;
    var _promoteProject_decorators;
    var _donate_decorators;
    var _upgradeApiKey_decorators;
    var BillingController = _classThis = /** @class */ (function () {
        function BillingController_1(billing) {
            this.billing = (__runInitializers(this, _instanceExtraInitializers), billing);
        }
        BillingController_1.prototype.getPlans = function () {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.billing.getPlans()];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, { statusCode: 200, message: 'Plans retrieved', data: data }];
                    }
                });
            });
        };
        BillingController_1.prototype.createCheckout = function (body, req) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.billing.createCheckoutSession(req.user.id, body.planSlug, body.successUrl, body.cancelUrl)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, { statusCode: 200, message: 'Checkout session created', data: data }];
                    }
                });
            });
        };
        BillingController_1.prototype.createPortal = function (body, req) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.billing.createPortalSession(req.user.id, body.returnUrl)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, { statusCode: 200, message: 'Portal session created', data: data }];
                    }
                });
            });
        };
        BillingController_1.prototype.getSubscription = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.billing.getSubscription(req.user.id)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, { statusCode: 200, message: 'Subscription retrieved', data: data }];
                    }
                });
            });
        };
        BillingController_1.prototype.getBillingHistory = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.billing.getBillingHistory(req.user.id)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, { statusCode: 200, message: 'Billing history retrieved', data: data }];
                    }
                });
            });
        };
        BillingController_1.prototype.promoteProject = function (body, req) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.billing.promoteProject(req.user.id, body.projectId)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, { statusCode: 200, message: 'Promotion checkout created', data: data }];
                    }
                });
            });
        };
        BillingController_1.prototype.donate = function (body, req) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.billing.createDonation(req.user.id, body.recipientId, body.amount, body.message, body.anonymous)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, { statusCode: 200, message: 'Donation checkout created', data: data }];
                    }
                });
            });
        };
        BillingController_1.prototype.upgradeApiKey = function (req, id) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.billing.upgradeApiKey(req.user.id, id)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, { statusCode: 200, message: 'API key tier upgraded', data: data }];
                    }
                });
            });
        };
        return BillingController_1;
    }());
    __setFunctionName(_classThis, "BillingController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getPlans_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('plans')];
        _createCheckout_decorators = [(0, common_1.Post)('checkout'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _createPortal_decorators = [(0, common_1.Post)('portal'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getSubscription_decorators = [(0, common_1.Get)('subscription'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getBillingHistory_decorators = [(0, common_1.Get)('history'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _promoteProject_decorators = [(0, common_1.Post)('promote'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _donate_decorators = [(0, common_1.Post)('donate'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _upgradeApiKey_decorators = [(0, common_1.Post)('api-keys/:id/upgrade'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        __esDecorate(_classThis, null, _getPlans_decorators, { kind: "method", name: "getPlans", static: false, private: false, access: { has: function (obj) { return "getPlans" in obj; }, get: function (obj) { return obj.getPlans; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createCheckout_decorators, { kind: "method", name: "createCheckout", static: false, private: false, access: { has: function (obj) { return "createCheckout" in obj; }, get: function (obj) { return obj.createCheckout; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createPortal_decorators, { kind: "method", name: "createPortal", static: false, private: false, access: { has: function (obj) { return "createPortal" in obj; }, get: function (obj) { return obj.createPortal; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSubscription_decorators, { kind: "method", name: "getSubscription", static: false, private: false, access: { has: function (obj) { return "getSubscription" in obj; }, get: function (obj) { return obj.getSubscription; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBillingHistory_decorators, { kind: "method", name: "getBillingHistory", static: false, private: false, access: { has: function (obj) { return "getBillingHistory" in obj; }, get: function (obj) { return obj.getBillingHistory; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _promoteProject_decorators, { kind: "method", name: "promoteProject", static: false, private: false, access: { has: function (obj) { return "promoteProject" in obj; }, get: function (obj) { return obj.promoteProject; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _donate_decorators, { kind: "method", name: "donate", static: false, private: false, access: { has: function (obj) { return "donate" in obj; }, get: function (obj) { return obj.donate; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _upgradeApiKey_decorators, { kind: "method", name: "upgradeApiKey", static: false, private: false, access: { has: function (obj) { return "upgradeApiKey" in obj; }, get: function (obj) { return obj.upgradeApiKey; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BillingController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BillingController = _classThis;
}();
exports.BillingController = BillingController;
