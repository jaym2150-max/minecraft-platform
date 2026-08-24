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
exports.AuthService = void 0;
var common_1 = require("@nestjs/common");
var bcrypt = require("bcryptjs");
var crypto = require("crypto");
var otplib_1 = require("otplib");
var TOKEN_PREFIX_LENGTH = 8;
var AuthService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AuthService = _classThis = /** @class */ (function () {
        function AuthService_1(usersService, jwtService, prisma, configService) {
            this.usersService = usersService;
            this.jwtService = jwtService;
            this.prisma = prisma;
            this.configService = configService;
            this.logger = new common_1.Logger(AuthService.name);
            this.algorithm = 'aes-256-gcm';
            this.keyLength = 32;
            this.ivLength = 16;
            this.tagLength = 16;
        }
        AuthService_1.prototype.getEncryptionKey = function () {
            var secret = this.configService.get('app.tfaEncKey');
            if (!secret || secret.length < 16) {
                throw new Error('TFA_ENC_KEY must be set and at least 16 characters');
            }
            return crypto.scryptSync(secret, 'tfa-salt', this.keyLength);
        };
        AuthService_1.prototype.encrypt = function (text) {
            var key = this.getEncryptionKey();
            var iv = crypto.randomBytes(this.ivLength);
            var cipher = crypto.createCipheriv(this.algorithm, key, iv);
            var encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            var tag = cipher.getAuthTag().toString('hex');
            return "".concat(iv.toString('hex'), ":").concat(tag, ":").concat(encrypted);
        };
        AuthService_1.prototype.decrypt = function (encoded) {
            var key = this.getEncryptionKey();
            var parts = encoded.split(':');
            if (parts.length !== 3)
                throw new Error('Invalid encrypted format');
            var ivHex = parts[0], tagHex = parts[1], encrypted = parts[2];
            var decipher = crypto.createDecipheriv(this.algorithm, key, Buffer.from(ivHex, 'hex'));
            decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
            var decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        };
        AuthService_1.prototype.validateUser = function (email, password) {
            return __awaiter(this, void 0, void 0, function () {
                var user, _a, _, result;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.usersService.findByEmailInternal(email)];
                        case 1:
                            user = _b.sent();
                            _a = user && user.passwordHash;
                            if (!_a) return [3 /*break*/, 3];
                            return [4 /*yield*/, bcrypt.compare(password, user.passwordHash)];
                        case 2:
                            _a = (_b.sent());
                            _b.label = 3;
                        case 3:
                            if (_a) {
                                _ = user.passwordHash, result = __rest(user, ["passwordHash"]);
                                return [2 /*return*/, result];
                            }
                            return [2 /*return*/, null];
                    }
                });
            });
        };
        AuthService_1.prototype.login = function (user, sessionMeta) {
            return __awaiter(this, void 0, void 0, function () {
                var sessionId, tokenHash, sessionTTL, expiresAt, payload, accessToken;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, this.usersService.updateLastLogin(user.id)];
                        case 1:
                            _d.sent();
                            sessionId = crypto.randomUUID();
                            tokenHash = crypto.createHash('sha256').update(sessionId).digest('hex');
                            sessionTTL = this.configService.get('SESSION_TTL_SECONDS', 24 * 60 * 60);
                            expiresAt = new Date(Date.now() + sessionTTL * 1000);
                            return [4 /*yield*/, this.prisma.session.create({
                                    data: {
                                        id: sessionId,
                                        userId: user.id,
                                        tokenHash: tokenHash,
                                        ip: sessionMeta === null || sessionMeta === void 0 ? void 0 : sessionMeta.ip,
                                        device: sessionMeta === null || sessionMeta === void 0 ? void 0 : sessionMeta.userAgent,
                                        expiresAt: expiresAt,
                                    },
                                })];
                        case 2:
                            _d.sent();
                            payload = {
                                username: user.username,
                                sub: user.id,
                                email: user.email,
                                role: user.role,
                                jti: sessionId,
                            };
                            accessToken = this.jwtService.sign(payload);
                            return [2 /*return*/, {
                                    data: {
                                        user: {
                                            id: user.id,
                                            username: user.username,
                                            displayName: (_a = user.displayName) !== null && _a !== void 0 ? _a : undefined,
                                            email: user.email,
                                            emailVerified: (_b = user.emailVerified) !== null && _b !== void 0 ? _b : false,
                                            avatarUrl: (_c = user.avatarUrl) !== null && _c !== void 0 ? _c : undefined,
                                            role: user.role,
                                        },
                                        token: accessToken,
                                    },
                                }];
                    }
                });
            });
        };
        /**
         * Validate that the session backing a JWT (identified by its `jti`) still
         * exists and has not expired. (JwtStrategy performs this check inline via
         * Prisma; this helper is retained for use by other services/tests.)
         */
        AuthService_1.prototype.validateSession = function (jti) {
            return __awaiter(this, void 0, void 0, function () {
                var session;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!jti)
                                return [2 /*return*/, false];
                            return [4 /*yield*/, this.prisma.session.findUnique({
                                    where: { id: jti },
                                    select: { expiresAt: true },
                                })];
                        case 1:
                            session = _a.sent();
                            if (!session)
                                return [2 /*return*/, false];
                            if (session.expiresAt < new Date())
                                return [2 /*return*/, false];
                            return [2 /*return*/, true];
                    }
                });
            });
        };
        AuthService_1.prototype.register = function (username, email, password) {
            return __awaiter(this, void 0, void 0, function () {
                var existingUser, existingUsername, passwordHash, user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.usersService.findByEmail(email)];
                        case 1:
                            existingUser = _a.sent();
                            if (existingUser) {
                                throw new common_1.ConflictException('User with this email already exists');
                            }
                            return [4 /*yield*/, this.usersService.findOneByUsername(username)];
                        case 2:
                            existingUsername = _a.sent();
                            if (existingUsername) {
                                throw new common_1.ConflictException('Username already taken');
                            }
                            return [4 /*yield*/, this.usersService.hashPassword(password)];
                        case 3:
                            passwordHash = _a.sent();
                            return [4 /*yield*/, this.usersService.create({
                                    username: username,
                                    email: email,
                                    passwordHash: passwordHash,
                                })];
                        case 4:
                            user = _a.sent();
                            // Create verification token (logged in dev)
                            return [4 /*yield*/, this.createEmailVerificationToken(user.id, user.email)];
                        case 5:
                            // Create verification token (logged in dev)
                            _a.sent();
                            return [2 /*return*/, this.login(user)];
                    }
                });
            });
        };
        AuthService_1.prototype.updatePassword = function (userId, newPassword) {
            return __awaiter(this, void 0, void 0, function () {
                var passwordHash;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.usersService.hashPassword(newPassword)];
                        case 1:
                            passwordHash = _a.sent();
                            return [4 /*yield*/, this.usersService.update(userId, { passwordHash: passwordHash })];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.invalidateAllSessions(userId)];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.createPasswordResetToken = function (email) {
            return __awaiter(this, void 0, void 0, function () {
                var user, rawToken, tokenHash, tokenPrefixHash, expiresAt;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.usersService.findByEmail(email)];
                        case 1:
                            user = _a.sent();
                            if (!user)
                                return [2 /*return*/, null];
                            rawToken = crypto.randomBytes(32).toString('hex');
                            return [4 /*yield*/, bcrypt.hash(rawToken, 10)];
                        case 2:
                            tokenHash = _a.sent();
                            tokenPrefixHash = crypto.createHash('sha256').update(rawToken.slice(0, TOKEN_PREFIX_LENGTH)).digest('hex');
                            expiresAt = new Date(Date.now() + 3600000);
                            return [4 /*yield*/, this.prisma.passwordResetToken.create({
                                    data: {
                                        userId: user.id,
                                        tokenHash: tokenHash,
                                        tokenPrefixHash: tokenPrefixHash,
                                        expiresAt: expiresAt,
                                    },
                                })];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, { rawToken: rawToken, userId: user.id }];
                    }
                });
            });
        };
        AuthService_1.prototype.resetPassword = function (token, newPassword) {
            return __awaiter(this, void 0, void 0, function () {
                var tokenPrefixHash, resetToken, isValid;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tokenPrefixHash = crypto.createHash('sha256').update(token.slice(0, TOKEN_PREFIX_LENGTH)).digest('hex');
                            return [4 /*yield*/, this.prisma.passwordResetToken.findUnique({
                                    where: { tokenPrefixHash: tokenPrefixHash },
                                })];
                        case 1:
                            resetToken = _a.sent();
                            if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
                                throw new common_1.BadRequestException('Invalid or expired reset token');
                            }
                            return [4 /*yield*/, bcrypt.compare(token, resetToken.tokenHash)];
                        case 2:
                            isValid = _a.sent();
                            if (!isValid) {
                                throw new common_1.BadRequestException('Invalid or expired reset token');
                            }
                            return [4 /*yield*/, this.updatePassword(resetToken.userId, newPassword)];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, this.prisma.passwordResetToken.update({
                                    where: { id: resetToken.id },
                                    data: { used: true },
                                })];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, this.prisma.passwordResetToken.deleteMany({
                                    where: { userId: resetToken.userId, used: false },
                                })];
                        case 5:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.enable2FA = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var secret, backupCodes, hashedBackupCodes, encryptedSecret, qrCodeUrl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            secret = otplib_1.authenticator.generateSecret();
                            backupCodes = Array.from({ length: 8 }, function () {
                                return crypto.randomBytes(4).toString('hex');
                            });
                            return [4 /*yield*/, Promise.all(backupCodes.map(function (code) { return bcrypt.hash(code, 10); }))];
                        case 1:
                            hashedBackupCodes = _a.sent();
                            encryptedSecret = this.encrypt(secret);
                            return [4 /*yield*/, this.prisma.twoFactorSecret.upsert({
                                    where: { userId: userId },
                                    update: { secret: encryptedSecret, backupCodes: hashedBackupCodes, verified: false },
                                    create: { userId: userId, secret: encryptedSecret, backupCodes: hashedBackupCodes, verified: false },
                                })];
                        case 2:
                            _a.sent();
                            qrCodeUrl = otplib_1.authenticator.keyuri(userId, 'MinecraftPlatform', secret);
                            return [2 /*return*/, { secret: secret, qrCodeUrl: qrCodeUrl, backupCodes: backupCodes }];
                    }
                });
            });
        };
        AuthService_1.prototype.verify2FA = function (userId, code) {
            return __awaiter(this, void 0, void 0, function () {
                var twoFA, secret, isValid, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.twoFactorSecret.findUnique({ where: { userId: userId } })];
                        case 1:
                            twoFA = _b.sent();
                            if (!twoFA)
                                return [2 /*return*/, false];
                            secret = this.decrypt(twoFA.secret);
                            _a = otplib_1.authenticator.verify({ token: code, secret: secret });
                            if (_a) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.verifyBackupCode(twoFA, code)];
                        case 2:
                            _a = (_b.sent());
                            _b.label = 3;
                        case 3:
                            isValid = _a;
                            if (!isValid) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.prisma.twoFactorSecret.update({
                                    where: { userId: userId },
                                    data: { verified: true },
                                })];
                        case 4:
                            _b.sent();
                            _b.label = 5;
                        case 5: return [2 /*return*/, isValid];
                    }
                });
            });
        };
        AuthService_1.prototype.disable2FA = function (userId, code) {
            return __awaiter(this, void 0, void 0, function () {
                var twoFA, secret, isValid, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.twoFactorSecret.findUnique({ where: { userId: userId } })];
                        case 1:
                            twoFA = _b.sent();
                            if (!twoFA)
                                return [2 /*return*/, false];
                            secret = this.decrypt(twoFA.secret);
                            _a = otplib_1.authenticator.verify({ token: code, secret: secret });
                            if (_a) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.verifyBackupCode(twoFA, code)];
                        case 2:
                            _a = (_b.sent());
                            _b.label = 3;
                        case 3:
                            isValid = _a;
                            if (!isValid) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.prisma.twoFactorSecret.delete({ where: { userId: userId } })];
                        case 4:
                            _b.sent();
                            _b.label = 5;
                        case 5: return [2 /*return*/, isValid];
                    }
                });
            });
        };
        AuthService_1.prototype.verifyBackupCode = function (twoFA, code) {
            return __awaiter(this, void 0, void 0, function () {
                var _loop_1, this_1, _i, _a, hashedCode, state_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _loop_1 = function (hashedCode) {
                                var remaining;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0: return [4 /*yield*/, bcrypt.compare(code, hashedCode)];
                                        case 1:
                                            if (!_c.sent()) return [3 /*break*/, 3];
                                            remaining = twoFA.backupCodes.filter(function (c) { return c !== hashedCode; });
                                            return [4 /*yield*/, this_1.prisma.twoFactorSecret.update({
                                                    where: { userId: twoFA.userId },
                                                    data: { backupCodes: remaining },
                                                })];
                                        case 2:
                                            _c.sent();
                                            return [2 /*return*/, { value: true }];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            };
                            this_1 = this;
                            _i = 0, _a = twoFA.backupCodes;
                            _b.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 4];
                            hashedCode = _a[_i];
                            return [5 /*yield**/, _loop_1(hashedCode)];
                        case 2:
                            state_1 = _b.sent();
                            if (typeof state_1 === "object")
                                return [2 /*return*/, state_1.value];
                            _b.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/, false];
                    }
                });
            });
        };
        AuthService_1.prototype.invalidateAllSessions = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.session.deleteMany({ where: { userId: userId } })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Revoke a single session by its id (the JWT `jti`). Used by logout so the
         * token is dead server-side, not merely cleared from the browser.
         */
        AuthService_1.prototype.revokeSession = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.prisma.session.delete({ where: { id: sessionId } })];
                        case 1:
                            _b.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            _a = _b.sent();
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        AuthService_1.prototype.sendVerificationEmail = function (email) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({ where: { email: email } })];
                        case 1:
                            user = _a.sent();
                            if (!user)
                                return [2 /*return*/, { sent: false }];
                            if (user.emailVerified)
                                return [2 /*return*/, { sent: false, alreadyVerified: true }];
                            return [4 /*yield*/, this.createEmailVerificationToken(user.id, user.email)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { sent: true }];
                    }
                });
            });
        };
        AuthService_1.prototype.resendVerification = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: userId } })];
                        case 1:
                            user = _a.sent();
                            if (!user)
                                return [2 /*return*/, { sent: false }];
                            if (user.emailVerified)
                                return [2 /*return*/, { sent: false, alreadyVerified: true }];
                            return [4 /*yield*/, this.createEmailVerificationToken(user.id, user.email)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { sent: true }];
                    }
                });
            });
        };
        AuthService_1.prototype.createEmailVerificationToken = function (userId, email) {
            return __awaiter(this, void 0, void 0, function () {
                var rawToken, tokenHash, tokenPrefixHash, expiresAt, origin;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: 
                        // Invalidate any existing unused tokens for this user
                        return [4 /*yield*/, this.prisma.emailVerificationToken.updateMany({
                                where: { userId: userId, used: false, expiresAt: { gte: new Date() } },
                                data: { expiresAt: new Date(0) },
                            })];
                        case 1:
                            // Invalidate any existing unused tokens for this user
                            _b.sent();
                            rawToken = crypto.randomBytes(32).toString('hex');
                            return [4 /*yield*/, bcrypt.hash(rawToken, 10)];
                        case 2:
                            tokenHash = _b.sent();
                            tokenPrefixHash = crypto.createHash('sha256').update(rawToken.slice(0, TOKEN_PREFIX_LENGTH)).digest('hex');
                            expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
                            return [4 /*yield*/, this.prisma.emailVerificationToken.create({
                                    data: { userId: userId, email: email, tokenHash: tokenHash, tokenPrefixHash: tokenPrefixHash, expiresAt: expiresAt },
                                })];
                        case 3:
                            _b.sent();
                            origin = (_a = process.env.APP_URL) !== null && _a !== void 0 ? _a : 'http://localhost:3003';
                            this.logger.log("Email verification for ".concat(email, ": ").concat(origin, "/verify-email?token=").concat(rawToken));
                            return [2 /*return*/, { rawToken: rawToken }];
                    }
                });
            });
        };
        AuthService_1.prototype.verifyEmail = function (token) {
            return __awaiter(this, void 0, void 0, function () {
                var tokenPrefixHash, verificationToken, isValid;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tokenPrefixHash = crypto.createHash('sha256').update(token.slice(0, TOKEN_PREFIX_LENGTH)).digest('hex');
                            return [4 /*yield*/, this.prisma.emailVerificationToken.findUnique({
                                    where: { tokenPrefixHash: tokenPrefixHash },
                                })];
                        case 1:
                            verificationToken = _a.sent();
                            if (!verificationToken || verificationToken.used || verificationToken.expiresAt < new Date()) {
                                throw new common_1.BadRequestException('Invalid or expired verification token');
                            }
                            return [4 /*yield*/, bcrypt.compare(token, verificationToken.tokenHash)];
                        case 2:
                            isValid = _a.sent();
                            if (!isValid) {
                                throw new common_1.BadRequestException('Invalid or expired verification token');
                            }
                            return [4 /*yield*/, this.prisma.$transaction([
                                    this.prisma.user.update({
                                        where: { id: verificationToken.userId },
                                        data: { emailVerified: true },
                                    }),
                                    this.prisma.emailVerificationToken.update({
                                        where: { id: verificationToken.id },
                                        data: { used: true },
                                    }),
                                ])];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return AuthService_1;
    }());
    __setFunctionName(_classThis, "AuthService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
}();
exports.AuthService = AuthService;
