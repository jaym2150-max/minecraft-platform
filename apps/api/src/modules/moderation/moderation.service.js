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
exports.ModerationService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var ModerationService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ModerationService = _classThis = /** @class */ (function () {
        function ModerationService_1(prisma) {
            this.prisma = prisma;
            this.logger = new common_1.Logger(ModerationService.name);
        }
        ModerationService_1.prototype.createReport = function (reporterId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var projectId, user, comment, version, report;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            projectId = null;
                            if (!(dto.type === 'project')) return [3 /*break*/, 1];
                            projectId = dto.reportedId;
                            return [3 /*break*/, 7];
                        case 1:
                            if (!(dto.type === 'user')) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.user.findUnique({ where: { id: dto.reportedId } })];
                        case 2:
                            user = _a.sent();
                            if (!user)
                                throw new common_1.NotFoundException('Reported user not found');
                            return [3 /*break*/, 7];
                        case 3:
                            if (!(dto.type === 'comment')) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.prisma.comment.findUnique({ where: { id: dto.reportedId } })];
                        case 4:
                            comment = _a.sent();
                            if (!comment)
                                throw new common_1.NotFoundException('Reported comment not found');
                            projectId = comment.projectId;
                            return [3 /*break*/, 7];
                        case 5:
                            if (!(dto.type === 'version')) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.prisma.projectVersion.findUnique({ where: { id: dto.reportedId } })];
                        case 6:
                            version = _a.sent();
                            if (!version)
                                throw new common_1.NotFoundException('Reported version not found');
                            projectId = version.projectId;
                            _a.label = 7;
                        case 7: return [4 /*yield*/, this.prisma.report.create({
                                data: {
                                    reporterId: reporterId,
                                    reportedId: dto.reportedId,
                                    reason: dto.reason,
                                    description: dto.description,
                                    projectId: projectId,
                                    status: client_1.ReportStatus.PENDING,
                                },
                                include: {
                                    reporter: { select: { id: true, username: true } },
                                },
                            })];
                        case 8:
                            report = _a.sent();
                            return [2 /*return*/, this.format(report)];
                    }
                });
            });
        };
        ModerationService_1.prototype.findAllReports = function () {
            return __awaiter(this, arguments, void 0, function (page, limit, status) {
                var where, skip, _a, reports, total;
                var _this = this;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            where = status ? { status: status } : {};
                            skip = (page - 1) * limit;
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.report.findMany({
                                        where: where,
                                        skip: skip,
                                        take: limit,
                                        orderBy: { createdAt: 'desc' },
                                        include: {
                                            reporter: { select: { id: true, username: true, avatarUrl: true } },
                                        },
                                    }),
                                    this.prisma.report.count({ where: where }),
                                ])];
                        case 1:
                            _a = _b.sent(), reports = _a[0], total = _a[1];
                            return [2 /*return*/, {
                                    data: reports.map(function (r) { return _this.format(r); }),
                                    meta: { page: page, limit: limit, total: total, totalPages: Math.ceil(total / limit) },
                                }];
                    }
                });
            });
        };
        ModerationService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var report;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.report.findUnique({
                                where: { id: id },
                                include: {
                                    reporter: { select: { id: true, username: true, avatarUrl: true } },
                                },
                            })];
                        case 1:
                            report = _a.sent();
                            if (!report) {
                                throw new common_1.NotFoundException("Report with id \"".concat(id, "\" not found"));
                            }
                            return [2 /*return*/, this.format(report)];
                    }
                });
            });
        };
        ModerationService_1.prototype.resolve = function (id, resolverId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var report, updated;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.report.findUnique({ where: { id: id } })];
                        case 1:
                            report = _b.sent();
                            if (!report) {
                                throw new common_1.NotFoundException("Report with id \"".concat(id, "\" not found"));
                            }
                            if (report.status !== client_1.ReportStatus.PENDING) {
                                throw new common_1.NotFoundException("Report with id \"".concat(id, "\" is already ").concat(report.status.toLowerCase()));
                            }
                            return [4 /*yield*/, this.prisma.report.update({
                                    where: { id: id },
                                    data: {
                                        status: dto.status,
                                        resolvedAt: new Date(),
                                        resolvedBy: resolverId,
                                        description: dto.resolution
                                            ? "".concat((_a = report.description) !== null && _a !== void 0 ? _a : '', "\n\n[Resolution]: ").concat(dto.resolution).trim()
                                            : report.description,
                                    },
                                    include: {
                                        reporter: { select: { id: true, username: true, avatarUrl: true } },
                                    },
                                })];
                        case 2:
                            updated = _b.sent();
                            return [2 /*return*/, this.format(updated)];
                    }
                });
            });
        };
        ModerationService_1.prototype.getStats = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, pending, resolved, dismissed, byReason;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                this.prisma.report.count({ where: { status: 'PENDING' } }),
                                this.prisma.report.count({ where: { status: 'RESOLVED' } }),
                                this.prisma.report.count({ where: { status: 'DISMISSED' } }),
                                this.prisma.report.groupBy({
                                    by: ['reason'],
                                    _count: { id: true },
                                    orderBy: { _count: { id: 'desc' } },
                                    take: 10,
                                }),
                            ])];
                        case 1:
                            _a = _b.sent(), pending = _a[0], resolved = _a[1], dismissed = _a[2], byReason = _a[3];
                            return [2 /*return*/, {
                                    pending: pending,
                                    resolved: resolved,
                                    dismissed: dismissed,
                                    total: pending + resolved + dismissed,
                                    topReasons: byReason.map(function (r) { return ({ reason: r.reason, count: r._count.id }); }),
                                }];
                    }
                });
            });
        };
        ModerationService_1.prototype.format = function (report) {
            var _a, _b, _c;
            return {
                id: report.id,
                reason: report.reason,
                description: (_a = report.description) !== null && _a !== void 0 ? _a : undefined,
                status: report.status,
                reporterId: report.reporterId,
                reportedId: report.reportedId,
                projectId: (_b = report.projectId) !== null && _b !== void 0 ? _b : undefined,
                createdAt: report.createdAt instanceof Date ? report.createdAt.toISOString() : report.createdAt,
                resolvedAt: report.resolvedAt instanceof Date ? report.resolvedAt.toISOString() : report.resolvedAt,
                resolvedBy: (_c = report.resolvedBy) !== null && _c !== void 0 ? _c : undefined,
                reporter: report.reporter,
            };
        };
        return ModerationService_1;
    }());
    __setFunctionName(_classThis, "ModerationService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ModerationService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ModerationService = _classThis;
}();
exports.ModerationService = ModerationService;
