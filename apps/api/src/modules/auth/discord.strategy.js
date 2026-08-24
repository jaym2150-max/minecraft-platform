"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.DiscordStrategy = void 0;
var common_1 = require("@nestjs/common");
var passport_1 = require("@nestjs/passport");
var passport_discord_1 = require("passport-discord");
var DiscordStrategy = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = (0, passport_1.PassportStrategy)(passport_discord_1.Strategy, 'discord');
    var DiscordStrategy = _classThis = /** @class */ (function (_super) {
        __extends(DiscordStrategy_1, _super);
        function DiscordStrategy_1(configService, prisma) {
            var _this = this;
            var clientID = configService.get('app.discordClientId');
            var clientSecret = configService.get('app.discordClientSecret');
            var hasConfig = !!(clientID && clientSecret);
            _this = _super.call(this, {
                clientID: hasConfig ? clientID : 'not-configured',
                clientSecret: hasConfig ? clientSecret : 'not-configured',
                callbackURL: "".concat(configService.get('app.apiUrl') || 'http://localhost:4000', "/api/v1/auth/discord/callback"),
                scope: ['identify', 'email'],
            }) || this;
            _this.configService = configService;
            _this.prisma = prisma;
            _this.logger = new common_1.Logger(DiscordStrategy.name);
            _this.configured = false;
            _this.configured = hasConfig;
            return _this;
        }
        DiscordStrategy_1.prototype.validate = function (accessToken, refreshToken, profile) {
            return __awaiter(this, void 0, void 0, function () {
                var id, username, email, displayName, avatarUrl, user, _a, _b;
                var _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            if (!this.configured) {
                                throw new common_1.UnauthorizedException('Discord OAuth is not configured');
                            }
                            id = profile.id;
                            username = profile.username;
                            email = profile.email;
                            displayName = profile.global_name || profile.username;
                            avatarUrl = profile.avatar
                                ? "https://cdn.discordapp.com/avatars/".concat(id, "/").concat(profile.avatar, ".png")
                                : undefined;
                            return [4 /*yield*/, this.prisma.user.findFirst({
                                    where: { discordId: id },
                                })];
                        case 1:
                            user = _e.sent();
                            if (!user) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: user.id },
                                    data: {
                                        avatarUrl: avatarUrl !== null && avatarUrl !== void 0 ? avatarUrl : user.avatarUrl,
                                        email: email !== null && email !== void 0 ? email : user.email,
                                        emailVerified: email ? true : user.emailVerified,
                                    },
                                })];
                        case 2:
                            user = _e.sent();
                            return [2 /*return*/, user];
                        case 3:
                            if (!email) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.prisma.user.findUnique({ where: { email: email } })];
                        case 4:
                            user = _e.sent();
                            if (!user) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.prisma.user.update({
                                    where: { id: user.id },
                                    data: {
                                        discordId: id,
                                        avatarUrl: avatarUrl !== null && avatarUrl !== void 0 ? avatarUrl : user.avatarUrl,
                                        emailVerified: true,
                                    },
                                })];
                        case 5:
                            user = _e.sent();
                            return [2 /*return*/, user];
                        case 6:
                            _b = (_a = this.prisma.user).create;
                            _c = {};
                            _d = {};
                            return [4 /*yield*/, this.uniqueUsername(username || "discord-".concat(id))];
                        case 7: return [4 /*yield*/, _b.apply(_a, [(_c.data = (_d.username = _e.sent(),
                                    _d.email = email !== null && email !== void 0 ? email : "".concat(id, "@discord.oauth"),
                                    _d.emailVerified = !!email,
                                    _d.discordId = id,
                                    _d.avatarUrl = avatarUrl,
                                    _d.displayName = displayName,
                                    _d.passwordHash = '',
                                    _d),
                                    _c)])];
                        case 8:
                            user = _e.sent();
                            return [2 /*return*/, user];
                    }
                });
            });
        };
        DiscordStrategy_1.prototype.uniqueUsername = function (base) {
            return __awaiter(this, void 0, void 0, function () {
                var username, suffix;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            username = base;
                            suffix = 1;
                            _a.label = 1;
                        case 1: return [4 /*yield*/, this.prisma.user.findUnique({ where: { username: username } })];
                        case 2:
                            if (!_a.sent()) return [3 /*break*/, 3];
                            username = "".concat(base, "_").concat(suffix);
                            suffix++;
                            return [3 /*break*/, 1];
                        case 3: return [2 /*return*/, username];
                    }
                });
            });
        };
        return DiscordStrategy_1;
    }(_classSuper));
    __setFunctionName(_classThis, "DiscordStrategy");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DiscordStrategy = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DiscordStrategy = _classThis;
}();
exports.DiscordStrategy = DiscordStrategy;
