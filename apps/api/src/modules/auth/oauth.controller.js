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
exports.OauthController = void 0;
var common_1 = require("@nestjs/common");
var passport_1 = require("@nestjs/passport");
var public_decorator_1 = require("../../common/decorators/public.decorator");
var auth_cookie_1 = require("../../common/auth-cookie");
var OauthController = function () {
    var _classDecorators = [(0, common_1.Controller)('auth')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _githubAuth_decorators;
    var _githubCallback_decorators;
    var _discordAuth_decorators;
    var _discordCallback_decorators;
    var OauthController = _classThis = /** @class */ (function () {
        function OauthController_1(authService, consentCodes, configService) {
            this.authService = (__runInitializers(this, _instanceExtraInitializers), authService);
            this.consentCodes = consentCodes;
            this.configService = configService;
            this.logger = new common_1.Logger(OauthController.name);
        }
        OauthController_1.prototype.githubAuth = function () {
            return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/];
            }); });
        };
        OauthController_1.prototype.githubCallback = function (req, res, callbackUrl) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.complete(req, res, callbackUrl, 'github')];
                });
            });
        };
        OauthController_1.prototype.discordAuth = function () {
            return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/];
            }); });
        };
        OauthController_1.prototype.discordCallback = function (req, res, callbackUrl) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.complete(req, res, callbackUrl, 'discord')];
                });
            });
        };
        OauthController_1.prototype.complete = function (req, res, callbackUrl, provider) {
            return __awaiter(this, void 0, void 0, function () {
                var user, webUrl, sanitizedCallback, jwtPayload, code, target, error_1, failure;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            user = req.user;
                            webUrl = this.configService.get('app.webUrl') || 'http://localhost:3003';
                            sanitizedCallback = this.sanitizeCallback(callbackUrl);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 5, , 6]);
                            return [4 /*yield*/, this.authService.login(user, {
                                    ip: this.extractIp(req),
                                    userAgent: req.headers['user-agent'],
                                })];
                        case 2:
                            jwtPayload = _a.sent();
                            res.cookie(auth_cookie_1.AUTH_COOKIE_NAME, jwtPayload.data.token, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'lax',
                                maxAge: 24 * 60 * 60 * 1000,
                                path: '/',
                            });
                            if (!this.consentCodes.isEnabled()) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.consentCodes.issueCode(jwtPayload.data.user.id, sanitizedCallback !== null && sanitizedCallback !== void 0 ? sanitizedCallback : undefined)];
                        case 3:
                            code = (_a.sent()).code;
                            target = sanitizedCallback !== null && sanitizedCallback !== void 0 ? sanitizedCallback : "/auth/oauth/callback?provider=".concat(provider);
                            return [2 /*return*/, res.redirect("".concat(webUrl).concat(target).concat(target.includes('?') ? '&' : '?', "code=").concat(encodeURIComponent(code)))];
                        case 4: return [2 /*return*/, res.redirect(sanitizedCallback !== null && sanitizedCallback !== void 0 ? sanitizedCallback : "".concat(webUrl, "/dashboard"))];
                        case 5:
                            error_1 = _a.sent();
                            this.logger.error("".concat(provider, " OAuth callback failed: ").concat(error_1));
                            failure = "".concat(webUrl, "/auth/oauth/callback?provider=").concat(provider, "&error=").concat(encodeURIComponent('OAuth callback failed'));
                            return [2 /*return*/, res.redirect(failure)];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        OauthController_1.prototype.sanitizeCallback = function (callback) {
            if (!callback)
                return null;
            if (callback.length > 512)
                return null;
            if (!callback.startsWith('/'))
                return null;
            if (callback.startsWith('//'))
                return null;
            return callback;
        };
        OauthController_1.prototype.extractIp = function (req) {
            var xff = req.headers['x-forwarded-for'];
            if (typeof xff === 'string')
                return xff.split(',')[0].trim();
            return req.ip;
        };
        return OauthController_1;
    }());
    __setFunctionName(_classThis, "OauthController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _githubAuth_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('github'), (0, common_1.UseGuards)((0, passport_1.AuthGuard)('github'))];
        _githubCallback_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('github/callback'), (0, common_1.UseGuards)((0, passport_1.AuthGuard)('github'))];
        _discordAuth_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('discord'), (0, common_1.UseGuards)((0, passport_1.AuthGuard)('discord'))];
        _discordCallback_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)('discord/callback'), (0, common_1.UseGuards)((0, passport_1.AuthGuard)('discord'))];
        __esDecorate(_classThis, null, _githubAuth_decorators, { kind: "method", name: "githubAuth", static: false, private: false, access: { has: function (obj) { return "githubAuth" in obj; }, get: function (obj) { return obj.githubAuth; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _githubCallback_decorators, { kind: "method", name: "githubCallback", static: false, private: false, access: { has: function (obj) { return "githubCallback" in obj; }, get: function (obj) { return obj.githubCallback; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _discordAuth_decorators, { kind: "method", name: "discordAuth", static: false, private: false, access: { has: function (obj) { return "discordAuth" in obj; }, get: function (obj) { return obj.discordAuth; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _discordCallback_decorators, { kind: "method", name: "discordCallback", static: false, private: false, access: { has: function (obj) { return "discordCallback" in obj; }, get: function (obj) { return obj.discordCallback; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OauthController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OauthController = _classThis;
}();
exports.OauthController = OauthController;
