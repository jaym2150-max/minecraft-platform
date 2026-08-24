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
exports.ThreadsService = void 0;
var common_1 = require("@nestjs/common");
var ThreadsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ThreadsService = _classThis = /** @class */ (function () {
        function ThreadsService_1(prisma) {
            this.prisma = prisma;
        }
        ThreadsService_1.prototype.listMine = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var threads;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.thread.findMany({
                                where: {
                                    OR: [
                                        { initiatorId: userId },
                                        { participants: { some: { userId: userId } } },
                                    ],
                                },
                                orderBy: { lastMessageAt: 'desc' },
                                include: {
                                    initiator: { select: { id: true, username: true, avatarUrl: true } },
                                    messages: {
                                        orderBy: { createdAt: 'desc' },
                                        take: 1,
                                        select: { id: true, body: true, createdAt: true, authorId: true },
                                    },
                                    _count: { select: { messages: true, participants: true } },
                                },
                            })];
                        case 1:
                            threads = _a.sent();
                            return [2 /*return*/, threads.map(function (t) { return _this.format(t); })];
                    }
                });
            });
        };
        ThreadsService_1.prototype.findOne = function (threadId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var thread, isParticipant;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.thread.findUnique({
                                where: { id: threadId },
                                include: {
                                    initiator: { select: { id: true, username: true, avatarUrl: true } },
                                    participants: {
                                        include: { user: { select: { id: true, username: true, avatarUrl: true } } },
                                    },
                                    messages: {
                                        orderBy: { createdAt: 'asc' },
                                        include: { author: { select: { id: true, username: true, avatarUrl: true } } },
                                    },
                                },
                            })];
                        case 1:
                            thread = _a.sent();
                            if (!thread)
                                throw new common_1.NotFoundException('Thread not found');
                            isParticipant = thread.initiatorId === userId ||
                                thread.participants.some(function (p) { return p.userId === userId; });
                            if (!isParticipant)
                                throw new common_1.ForbiddenException('Not a participant of this thread');
                            return [2 /*return*/, this.format(thread)];
                    }
                });
            });
        };
        ThreadsService_1.prototype.postMessage = function (threadId, userId, body) {
            return __awaiter(this, void 0, void 0, function () {
                var thread, isParticipant, _a, message;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.thread.findUnique({
                                where: { id: threadId },
                                select: { id: true, initiatorId: true, status: true },
                            })];
                        case 1:
                            thread = _b.sent();
                            if (!thread)
                                throw new common_1.NotFoundException('Thread not found');
                            _a = thread.initiatorId === userId;
                            if (_a) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.threadParticipant.findUnique({
                                    where: { threadId_userId: { threadId: threadId, userId: userId } },
                                })];
                        case 2:
                            _a = !!(_b.sent());
                            _b.label = 3;
                        case 3:
                            isParticipant = _a;
                            if (!isParticipant)
                                throw new common_1.ForbiddenException('Not a participant of this thread');
                            if (thread.status !== 'open')
                                throw new common_1.ForbiddenException('Thread is closed');
                            return [4 /*yield*/, this.prisma.$transaction([
                                    this.prisma.threadMessage.create({
                                        data: { threadId: threadId, authorId: userId, body: body },
                                    }),
                                    this.prisma.thread.update({
                                        where: { id: threadId },
                                        data: { lastMessageAt: new Date() },
                                    }),
                                ])];
                        case 4:
                            message = (_b.sent())[0];
                            return [2 /*return*/, {
                                    id: message.id,
                                    threadId: message.threadId,
                                    authorId: message.authorId,
                                    body: message.body,
                                    hidden: message.hidden,
                                    createdAt: message.createdAt.toISOString(),
                                }];
                    }
                });
            });
        };
        ThreadsService_1.prototype.format = function (t) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return {
                id: t.id,
                type: t.type,
                title: t.title,
                status: t.status,
                subjectId: (_a = t.subjectId) !== null && _a !== void 0 ? _a : undefined,
                subjectType: (_b = t.subjectType) !== null && _b !== void 0 ? _b : undefined,
                initiatorId: t.initiatorId,
                initiator: t.initiator,
                participants: (_c = t.participants) === null || _c === void 0 ? void 0 : _c.map(function (p) {
                    var _a, _b, _c;
                    return ({
                        userId: p.userId,
                        role: p.role,
                        joinedAt: (_c = (_b = (_a = p.joinedAt) === null || _a === void 0 ? void 0 : _a.toISOString) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : p.joinedAt,
                        user: p.user,
                    });
                }),
                lastMessageAt: t.lastMessageAt instanceof Date ? t.lastMessageAt.toISOString() : t.lastMessageAt,
                createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
                updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : t.updatedAt,
                messageCount: (_g = (_e = (_d = t._count) === null || _d === void 0 ? void 0 : _d.messages) !== null && _e !== void 0 ? _e : (_f = t.messages) === null || _f === void 0 ? void 0 : _f.length) !== null && _g !== void 0 ? _g : 0,
                messages: (_h = t.messages) === null || _h === void 0 ? void 0 : _h.map(function (m) { return ({
                    id: m.id,
                    threadId: m.threadId,
                    authorId: m.authorId,
                    author: m.author,
                    body: m.hidden ? '[hidden]' : m.body,
                    hidden: m.hidden,
                    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
                }); }),
            };
        };
        return ThreadsService_1;
    }());
    __setFunctionName(_classThis, "ThreadsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ThreadsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ThreadsService = _classThis;
}();
exports.ThreadsService = ThreadsService;
