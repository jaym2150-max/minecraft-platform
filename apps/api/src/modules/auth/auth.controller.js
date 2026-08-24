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
exports.AuthController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
var scopes_guard_1 = require("../../common/guards/scopes.guard");
var scopes_decorator_1 = require("../../common/decorators/scopes.decorator");
var public_decorator_1 = require("../../common/decorators/public.decorator");
var throttler_1 = require("@nestjs/throttler");
var client_1 = require("@prisma/client");
var auth_cookie_1 = require("../../common/auth-cookie");
var AuthController = function () {
    var _classDecorators = [(0, common_1.Controller)('auth')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _login_decorators;
    var _register_decorators;
    var _logout_decorators;
    var _getProfile_decorators;
    var _forgotPassword_decorators;
    var _resetPassword_decorators;
    var _changePassword_decorators;
    var _sendVerificationEmail_decorators;
    var _verifyEmail_decorators;
    var _resendVerification_decorators;
    var _enable2FA_decorators;
    var _verify2FA_decorators;
    var _disable2FA_decorators;
    var _exchangeOAuthCode_decorators;
    var AuthController = _classThis = /** @class */ (function () {
        function AuthController_1(authService, consentCodes) {
            this.authService = (__runInitializers(this, _instanceExtraInitializers), authService);
            this.consentCodes = consentCodes;
            this.logger = new common_1.Logger(AuthController.name);
        }
        AuthController_1.prototype.login = function (loginDto, req, res) {
            return __awaiter(this, void 0, void 0, function () {
                var user, headers, ip, userAgent, jwtPayload;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.authService.validateUser(loginDto.email, loginDto.password)];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.UnauthorizedException('Invalid credentials');
                            }
                            headers = req.headers;
                            ip = headers['x-forwarded-for'];
                            userAgent = headers['user-agent'];
                            return [4 /*yield*/, this.authService.login(user, { ip: ip, userAgent: userAgent })];
                        case 2:
                            jwtPayload = _a.sent();
                            res.cookie(auth_cookie_1.AUTH_COOKIE_NAME, jwtPayload.data.token, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'lax',
                                maxAge: 24 * 60 * 60 * 1000,
                                path: '/',
                            });
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Login successful',
                                    data: {
                                        user: jwtPayload.data.user,
                                    },
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AuthController_1.prototype.register = function (registerDto, res) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.authService.register(registerDto.username, registerDto.email, registerDto.password)];
                        case 1:
                            result = _a.sent();
                            res.cookie(auth_cookie_1.AUTH_COOKIE_NAME, result.data.token, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'lax',
                                maxAge: 24 * 60 * 60 * 1000,
                                path: '/',
                            });
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.CREATED,
                                    message: 'User registered successfully',
                                    data: {
                                        user: result.data.user,
                                    },
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AuthController_1.prototype.logout = function (req, res) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.jti)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.authService.revokeSession(req.user.jti)];
                        case 1:
                            _b.sent();
                            _b.label = 2;
                        case 2:
                            res.clearCookie(auth_cookie_1.AUTH_COOKIE_NAME);
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Logged out successfully',
                                    data: null,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AuthController_1.prototype.getProfile = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, {
                            statusCode: common_1.HttpStatus.OK,
                            message: 'Profile retrieved successfully',
                            data: req.user,
                            timestamp: new Date().toISOString(),
                        }];
                });
            });
        };
        AuthController_1.prototype.forgotPassword = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.authService.createPasswordResetToken(body.email)];
                        case 1:
                            result = _a.sent();
                            if (result) {
                                this.logger.log("Password reset requested for user ".concat(result.userId));
                            }
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.ACCEPTED,
                                    message: 'If an account exists with that email, a reset link has been sent.',
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AuthController_1.prototype.resetPassword = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.authService.resetPassword(body.token, body.password)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Password reset successfully',
                                    data: null,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AuthController_1.prototype.changePassword = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                var isValid;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.authService.validateUser(req.user.email, body.currentPassword)];
                        case 1:
                            isValid = _a.sent();
                            if (!isValid) {
                                throw new common_1.UnauthorizedException('Current password is incorrect');
                            }
                            return [4 /*yield*/, this.authService.updatePassword(req.user.id, body.newPassword)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Password changed successfully',
                                    data: null,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AuthController_1.prototype.sendVerificationEmail = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.authService.sendVerificationEmail(body.email)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: result.alreadyVerified
                                        ? 'Email is already verified.'
                                        : 'If an account exists with that email, a verification email has been sent.',
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AuthController_1.prototype.verifyEmail = function (body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.authService.verifyEmail(body.token)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Email verified successfully',
                                    data: null,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AuthController_1.prototype.resendVerification = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.authService.resendVerification(req.user.id)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: result.alreadyVerified
                                        ? 'Email is already verified.'
                                        : 'Verification email sent successfully',
                                    data: null,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AuthController_1.prototype.enable2FA = function (req) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.authService.enable2FA(req.user.id)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: '2FA setup initiated',
                                    data: result,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AuthController_1.prototype.verify2FA = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                var verified;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.authService.verify2FA(req.user.id, body.code)];
                        case 1:
                            verified = _a.sent();
                            if (!verified) {
                                throw new common_1.UnauthorizedException('Invalid verification code');
                            }
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: '2FA enabled successfully',
                                    data: null,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AuthController_1.prototype.disable2FA = function (req, body) {
            return __awaiter(this, void 0, void 0, function () {
                var disabled;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.authService.disable2FA(req.user.id, body.code)];
                        case 1:
                            disabled = _a.sent();
                            if (!disabled) {
                                throw new common_1.UnauthorizedException('Invalid verification code');
                            }
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: '2FA disabled successfully',
                                    data: null,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AuthController_1.prototype.exchangeOAuthCode = function (code, res) {
            return __awaiter(this, void 0, void 0, function () {
                var user, sessionMeta, jwtPayload;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!code || typeof code !== 'string') {
                                throw new common_1.BadRequestException('Missing consent code');
                            }
                            return [4 /*yield*/, this.consentCodes.consume(code)];
                        case 1:
                            user = _a.sent();
                            sessionMeta = { ip: this.extractIp(res), userAgent: undefined };
                            return [4 /*yield*/, this.authService.login(user, sessionMeta)];
                        case 2:
                            jwtPayload = _a.sent();
                            res.cookie(auth_cookie_1.AUTH_COOKIE_NAME, jwtPayload.data.token, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'lax',
                                maxAge: 24 * 60 * 60 * 1000,
                                path: '/',
                            });
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'OAuth exchange successful',
                                    data: { user: jwtPayload.data.user },
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        AuthController_1.prototype.extractIp = function (res) {
            var _a, _b;
            var req = res.req;
            var xff = (_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a['x-forwarded-for'];
            if (typeof xff === 'string')
                return xff.split(',')[0].trim();
            return (_b = req === null || req === void 0 ? void 0 : req.ip) !== null && _b !== void 0 ? _b : undefined;
        };
        return AuthController_1;
    }());
    __setFunctionName(_classThis, "AuthController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _login_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('login'), (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 5 } }), (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true }))];
        _register_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('register'), (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 5 } }), (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true }))];
        _logout_decorators = [(0, common_1.Post)('logout'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _getProfile_decorators = [(0, common_1.Get)('me'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
        _forgotPassword_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('forgot-password'), (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED), (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 3 } }), (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true }))];
        _resetPassword_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('reset-password'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true }))];
        _changePassword_decorators = [(0, common_1.Post)('change-password'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, scopes_guard_1.ScopesGuard), (0, scopes_decorator_1.Scopes)(client_1.ApiKeyScope.USER_WRITE, client_1.ApiKeyScope.WRITE), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true }))];
        _sendVerificationEmail_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('send-verification-email'), (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 3 } }), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _verifyEmail_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('verify-email'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _resendVerification_decorators = [(0, common_1.Post)('resend-verification'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _enable2FA_decorators = [(0, common_1.Post)('2fa/enable'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, scopes_guard_1.ScopesGuard), (0, scopes_decorator_1.Scopes)(client_1.ApiKeyScope.USER_WRITE, client_1.ApiKeyScope.WRITE), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _verify2FA_decorators = [(0, common_1.Post)('2fa/verify'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, scopes_guard_1.ScopesGuard), (0, scopes_decorator_1.Scopes)(client_1.ApiKeyScope.USER_WRITE, client_1.ApiKeyScope.WRITE), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true }))];
        _disable2FA_decorators = [(0, common_1.Post)('2fa/disable'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, scopes_guard_1.ScopesGuard), (0, scopes_decorator_1.Scopes)(client_1.ApiKeyScope.USER_WRITE, client_1.ApiKeyScope.DELETE), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true }))];
        _exchangeOAuthCode_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('oauth/exchange'), (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 10 } }), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        __esDecorate(_classThis, null, _login_decorators, { kind: "method", name: "login", static: false, private: false, access: { has: function (obj) { return "login" in obj; }, get: function (obj) { return obj.login; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _register_decorators, { kind: "method", name: "register", static: false, private: false, access: { has: function (obj) { return "register" in obj; }, get: function (obj) { return obj.register; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _logout_decorators, { kind: "method", name: "logout", static: false, private: false, access: { has: function (obj) { return "logout" in obj; }, get: function (obj) { return obj.logout; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProfile_decorators, { kind: "method", name: "getProfile", static: false, private: false, access: { has: function (obj) { return "getProfile" in obj; }, get: function (obj) { return obj.getProfile; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _forgotPassword_decorators, { kind: "method", name: "forgotPassword", static: false, private: false, access: { has: function (obj) { return "forgotPassword" in obj; }, get: function (obj) { return obj.forgotPassword; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _resetPassword_decorators, { kind: "method", name: "resetPassword", static: false, private: false, access: { has: function (obj) { return "resetPassword" in obj; }, get: function (obj) { return obj.resetPassword; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _changePassword_decorators, { kind: "method", name: "changePassword", static: false, private: false, access: { has: function (obj) { return "changePassword" in obj; }, get: function (obj) { return obj.changePassword; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendVerificationEmail_decorators, { kind: "method", name: "sendVerificationEmail", static: false, private: false, access: { has: function (obj) { return "sendVerificationEmail" in obj; }, get: function (obj) { return obj.sendVerificationEmail; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _verifyEmail_decorators, { kind: "method", name: "verifyEmail", static: false, private: false, access: { has: function (obj) { return "verifyEmail" in obj; }, get: function (obj) { return obj.verifyEmail; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _resendVerification_decorators, { kind: "method", name: "resendVerification", static: false, private: false, access: { has: function (obj) { return "resendVerification" in obj; }, get: function (obj) { return obj.resendVerification; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _enable2FA_decorators, { kind: "method", name: "enable2FA", static: false, private: false, access: { has: function (obj) { return "enable2FA" in obj; }, get: function (obj) { return obj.enable2FA; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _verify2FA_decorators, { kind: "method", name: "verify2FA", static: false, private: false, access: { has: function (obj) { return "verify2FA" in obj; }, get: function (obj) { return obj.verify2FA; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _disable2FA_decorators, { kind: "method", name: "disable2FA", static: false, private: false, access: { has: function (obj) { return "disable2FA" in obj; }, get: function (obj) { return obj.disable2FA; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _exchangeOAuthCode_decorators, { kind: "method", name: "exchangeOAuthCode", static: false, private: false, access: { has: function (obj) { return "exchangeOAuthCode" in obj; }, get: function (obj) { return obj.exchangeOAuthCode; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthController = _classThis;
}();
exports.AuthController = AuthController;
