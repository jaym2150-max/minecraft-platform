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
exports.OAuthConsentCodeService = void 0;
var common_1 = require("@nestjs/common");
var crypto_1 = require("crypto");
var DEFAULT_TTL_SECONDS = 60;
var MIN_TTL_SECONDS = 15;
var MAX_TTL_SECONDS = 300;
var OAuthConsentCodeService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var OAuthConsentCodeService = _classThis = /** @class */ (function () {
        function OAuthConsentCodeService_1(prisma, usersService, configService) {
            this.prisma = prisma;
            this.usersService = usersService;
            this.configService = configService;
            this.logger = new common_1.Logger(OAuthConsentCodeService.name);
        }
        OAuthConsentCodeService_1.prototype.issueCode = function (userId, callbackUrl) {
            return __awaiter(this, void 0, void 0, function () {
                var raw, codeHash, ttl, expiresAt;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            raw = (0, crypto_1.randomBytes)(32).toString('hex');
                            codeHash = (0, crypto_1.createHash)('sha256').update(raw).digest('hex');
                            ttl = this.resolveTtl();
                            expiresAt = new Date(Date.now() + ttl * 1000);
                            return [4 /*yield*/, this.prisma.oAuthConsentCode.create({
                                    data: {
                                        codeHash: codeHash,
                                        userId: userId,
                                        callbackUrl: this.normalizeCallback(callbackUrl),
                                        expiresAt: expiresAt,
                                    },
                                })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { code: raw, expiresAt: expiresAt }];
                    }
                });
            });
        };
        OAuthConsentCodeService_1.prototype.consume = function (code) {
            return __awaiter(this, void 0, void 0, function () {
                var codeHash, record, user;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            if (!code || typeof code !== 'string') {
                                throw new common_1.BadRequestException('Missing consent code');
                            }
                            codeHash = (0, crypto_1.createHash)('sha256').update(code).digest('hex');
                            return [4 /*yield*/, this.prisma.oAuthConsentCode.findUnique({
                                    where: { codeHash: codeHash },
                                })];
                        case 1:
                            record = _d.sent();
                            if (!record || record.consumedAt || record.expiresAt < new Date()) {
                                throw new common_1.BadRequestException('Invalid or expired consent code');
                            }
                            return [4 /*yield*/, this.usersService.findOne(record.userId)];
                        case 2:
                            user = _d.sent();
                            if (!user) {
                                throw new common_1.BadRequestException('User no longer exists');
                            }
                            return [4 /*yield*/, this.prisma.oAuthConsentCode.update({
                                    where: { id: record.id },
                                    data: { consumedAt: new Date() },
                                })];
                        case 3:
                            _d.sent();
                            return [2 /*return*/, {
                                    id: user.id,
                                    username: user.username,
                                    email: user.email,
                                    role: user.role,
                                    avatarUrl: (_a = user.avatarUrl) !== null && _a !== void 0 ? _a : undefined,
                                    displayName: (_b = user.displayName) !== null && _b !== void 0 ? _b : undefined,
                                    emailVerified: (_c = user.emailVerified) !== null && _c !== void 0 ? _c : false,
                                }];
                    }
                });
            });
        };
        OAuthConsentCodeService_1.prototype.isEnabled = function () {
            return this.configService.get('app.useOAuthConsentCode') !== false;
        };
        OAuthConsentCodeService_1.prototype.resolveTtl = function () {
            var _a;
            var raw = parseInt((_a = process.env.OAUTH_CONSENT_CODE_TTL_SECONDS) !== null && _a !== void 0 ? _a : "".concat(DEFAULT_TTL_SECONDS), 10);
            if (Number.isNaN(raw))
                return DEFAULT_TTL_SECONDS;
            return Math.min(MAX_TTL_SECONDS, Math.max(MIN_TTL_SECONDS, raw));
        };
        OAuthConsentCodeService_1.prototype.normalizeCallback = function (callbackUrl) {
            if (!callbackUrl)
                return null;
            if (callbackUrl.length > 512)
                return null;
            if (!/^https?:\/\//i.test(callbackUrl) && !callbackUrl.startsWith('/'))
                return null;
            return callbackUrl;
        };
        return OAuthConsentCodeService_1;
    }());
    __setFunctionName(_classThis, "OAuthConsentCodeService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OAuthConsentCodeService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OAuthConsentCodeService = _classThis;
}();
exports.OAuthConsentCodeService = OAuthConsentCodeService;
