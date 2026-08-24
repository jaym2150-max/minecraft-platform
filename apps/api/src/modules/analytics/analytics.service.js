"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.AnalyticsService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var AnalyticsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AnalyticsService = _classThis = /** @class */ (function () {
        function AnalyticsService_1(prisma) {
            this.prisma = prisma;
            this.logger = new common_1.Logger(AnalyticsService.name);
        }
        AnalyticsService_1.prototype.getStartDate = function (period) {
            if (period === 'all')
                return null;
            var now = new Date();
            var periodDays = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
            var days = periodDays[period];
            return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        };
        AnalyticsService_1.prototype.getPeriodDays = function (period) {
            var periodDays = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
            return period === 'all' ? 365 : periodDays[period];
        };
        AnalyticsService_1.prototype.getProjectAnalytics = function (projectId_1) {
            return __awaiter(this, arguments, void 0, function (projectId, period) {
                var project, startDate, _a, totalDownloads, totalViews, downloadsByDay, viewsByDay, downloadsByVersion, downloadsByLoader, uniqueVisitors;
                if (period === void 0) { period = '30d'; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({ where: { id: projectId } })];
                        case 1:
                            project = _b.sent();
                            if (!project) {
                                return [2 /*return*/, null];
                            }
                            startDate = this.getStartDate(period);
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.download.count({
                                        where: __assign({ projectId: projectId }, (startDate ? { createdAt: { gte: startDate } } : {})),
                                    }),
                                    project.views,
                                    this.getDownloadsByDay(projectId, startDate, period),
                                    this.getViewsByDay(projectId, startDate, period),
                                    this.getDownloadsByVersion(projectId, startDate),
                                    this.getDownloadsByLoader(projectId, startDate),
                                    this.getUniqueVisitors(projectId, startDate),
                                ])];
                        case 2:
                            _a = _b.sent(), totalDownloads = _a[0], totalViews = _a[1], downloadsByDay = _a[2], viewsByDay = _a[3], downloadsByVersion = _a[4], downloadsByLoader = _a[5], uniqueVisitors = _a[6];
                            return [2 /*return*/, {
                                    projectId: projectId,
                                    period: period,
                                    downloads: {
                                        total: totalDownloads,
                                        daily: downloadsByDay,
                                        byVersion: downloadsByVersion,
                                        byLoader: downloadsByLoader,
                                    },
                                    views: {
                                        total: totalViews,
                                        daily: viewsByDay,
                                    },
                                    uniqueVisitors: uniqueVisitors,
                                }];
                    }
                });
            });
        };
        AnalyticsService_1.prototype.getUserAnalytics = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, period) {
                var startDate, userProjects, userProjectIds, _a, projects, totalDownloads, totalViews, projectsByStatus;
                var _b, _c, _d, _e, _f;
                if (period === void 0) { period = '30d'; }
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            startDate = this.getStartDate(period);
                            return [4 /*yield*/, this.prisma.project.findMany({
                                    where: { authorId: userId },
                                    select: { id: true },
                                })];
                        case 1:
                            userProjects = _g.sent();
                            userProjectIds = userProjects.map(function (p) { return p.id; });
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.project.findMany({
                                        where: { authorId: userId },
                                        select: {
                                            id: true,
                                            title: true,
                                            slug: true,
                                            downloads: true,
                                            views: true,
                                            status: true,
                                            createdAt: true,
                                        },
                                        orderBy: { downloads: 'desc' },
                                    }),
                                    this.prisma.download.count({
                                        where: __assign({ projectId: { in: userProjectIds } }, (startDate ? { createdAt: { gte: startDate } } : {})),
                                    }),
                                    this.prisma.project.aggregate({
                                        where: { authorId: userId },
                                        _sum: { views: true },
                                    }),
                                    this.prisma.project.groupBy({
                                        by: ['status'],
                                        where: { authorId: userId },
                                        _count: { id: true },
                                    }),
                                ])];
                        case 2:
                            _a = _g.sent(), projects = _a[0], totalDownloads = _a[1], totalViews = _a[2], projectsByStatus = _a[3];
                            return [2 /*return*/, {
                                    userId: userId,
                                    period: period,
                                    summary: {
                                        totalProjects: projects.length,
                                        totalDownloads: totalDownloads,
                                        totalViews: (_b = totalViews._sum.views) !== null && _b !== void 0 ? _b : 0,
                                        publishedProjects: (_d = (_c = projectsByStatus.find(function (s) { return s.status === 'PUBLISHED'; })) === null || _c === void 0 ? void 0 : _c._count.id) !== null && _d !== void 0 ? _d : 0,
                                        draftProjects: (_f = (_e = projectsByStatus.find(function (s) { return s.status === 'DRAFT'; })) === null || _e === void 0 ? void 0 : _e._count.id) !== null && _f !== void 0 ? _f : 0,
                                    },
                                    topProjects: projects.slice(0, 10).map(function (p) { return ({
                                        id: p.id,
                                        title: p.title,
                                        slug: p.slug,
                                        downloads: p.downloads,
                                        views: p.views,
                                        status: p.status,
                                    }); }),
                                    projectsByStatus: projectsByStatus.map(function (s) { return ({
                                        status: s.status,
                                        count: s._count.id,
                                    }); }),
                                }];
                    }
                });
            });
        };
        AnalyticsService_1.prototype.getPlatformAnalytics = function () {
            return __awaiter(this, arguments, void 0, function (period) {
                var startDate, _a, totalUsers, totalProjects, totalDownloads, totalViews, activeUsers, downloadsTrend, newUsers, newProjects;
                var _b;
                if (period === void 0) { period = '30d'; }
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            startDate = this.getStartDate(period);
                            return [4 /*yield*/, Promise.all([
                                    this.prisma.user.count(),
                                    this.prisma.project.count(),
                                    this.prisma.download.count(),
                                    this.prisma.project.aggregate({ _sum: { views: true } }),
                                    this.prisma.user.count({
                                        where: { lastLoginAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
                                    }),
                                    this.getDownloadsTrend(startDate),
                                    this.prisma.user.count({
                                        where: __assign({}, (startDate ? { createdAt: { gte: startDate } } : {})),
                                    }),
                                    this.prisma.project.count({
                                        where: __assign({}, (startDate ? { createdAt: { gte: startDate } } : {})),
                                    }),
                                ])];
                        case 1:
                            _a = _c.sent(), totalUsers = _a[0], totalProjects = _a[1], totalDownloads = _a[2], totalViews = _a[3], activeUsers = _a[4], downloadsTrend = _a[5], newUsers = _a[6], newProjects = _a[7];
                            return [2 /*return*/, {
                                    period: period,
                                    summary: {
                                        totalUsers: totalUsers,
                                        totalProjects: totalProjects,
                                        totalDownloads: totalDownloads,
                                        totalViews: (_b = totalViews._sum.views) !== null && _b !== void 0 ? _b : 0,
                                        activeUsersLast7Days: activeUsers,
                                        newUsers: newUsers,
                                        newProjects: newProjects,
                                    },
                                    downloadsTrend: downloadsTrend,
                                }];
                    }
                });
            });
        };
        AnalyticsService_1.prototype.getDownloadsByDay = function (projectId, startDate, period) {
            return __awaiter(this, void 0, void 0, function () {
                var days, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            days = this.getPeriodDays(period);
                            return [4 /*yield*/, this.prisma.$queryRaw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      SELECT DATE(\"createdAt\") AS date, COUNT(*) AS count\n      FROM \"Download\"\n      WHERE \"projectId\" = ", "\n        ", "\n      GROUP BY DATE(\"createdAt\")\n      ORDER BY date ASC\n    "], ["\n      SELECT DATE(\"createdAt\") AS date, COUNT(*) AS count\n      FROM \"Download\"\n      WHERE \"projectId\" = ", "\n        ", "\n      GROUP BY DATE(\"createdAt\")\n      ORDER BY date ASC\n    "])), projectId, startDate ? client_1.Prisma.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["AND \"createdAt\" >= ", ""], ["AND \"createdAt\" >= ", ""])), startDate) : client_1.Prisma.empty)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, this.fillDayGaps(result, days)];
                    }
                });
            });
        };
        AnalyticsService_1.prototype.getViewsByDay = function (projectId, startDate, period) {
            return __awaiter(this, void 0, void 0, function () {
                var days, downloadsAsProxy;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            days = this.getPeriodDays(period);
                            return [4 /*yield*/, this.prisma.$queryRaw(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n      SELECT DATE(\"createdAt\") AS date, COUNT(*) AS count\n      FROM \"Download\"\n      WHERE \"projectId\" = ", "\n        ", "\n      GROUP BY DATE(\"createdAt\")\n      ORDER BY date ASC\n    "], ["\n      SELECT DATE(\"createdAt\") AS date, COUNT(*) AS count\n      FROM \"Download\"\n      WHERE \"projectId\" = ", "\n        ", "\n      GROUP BY DATE(\"createdAt\")\n      ORDER BY date ASC\n    "])), projectId, startDate ? client_1.Prisma.sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["AND \"createdAt\" >= ", ""], ["AND \"createdAt\" >= ", ""])), startDate) : client_1.Prisma.empty)];
                        case 1:
                            downloadsAsProxy = _a.sent();
                            return [2 /*return*/, this.fillDayGaps(downloadsAsProxy, days)];
                    }
                });
            });
        };
        AnalyticsService_1.prototype.getDownloadsByVersion = function (projectId, startDate) {
            return __awaiter(this, void 0, void 0, function () {
                var versions;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.projectVersion.findMany({
                                where: __assign({ projectId: projectId }, (startDate ? { createdAt: { gte: startDate } } : {})),
                                select: { version: true, downloads: true },
                            })];
                        case 1:
                            versions = _a.sent();
                            return [2 /*return*/, versions.map(function (v) { return ({
                                    version: v.version,
                                    count: v.downloads,
                                }); })];
                    }
                });
            });
        };
        AnalyticsService_1.prototype.getDownloadsByLoader = function (projectId, startDate) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.$queryRaw(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n      SELECT l.type, COALESCE(SUM(d.count), 0) AS count\n      FROM \"Loader\" l\n      LEFT JOIN (\n        SELECT \"versionId\", COUNT(*) AS count\n        FROM \"Download\"\n        WHERE \"projectId\" = ", "\n          ", "\n        GROUP BY \"versionId\"\n      ) d ON d.\"versionId\" = l.\"versionId\"\n      WHERE l.\"projectId\" = ", "\n      GROUP BY l.type\n    "], ["\n      SELECT l.type, COALESCE(SUM(d.count), 0) AS count\n      FROM \"Loader\" l\n      LEFT JOIN (\n        SELECT \"versionId\", COUNT(*) AS count\n        FROM \"Download\"\n        WHERE \"projectId\" = ", "\n          ", "\n        GROUP BY \"versionId\"\n      ) d ON d.\"versionId\" = l.\"versionId\"\n      WHERE l.\"projectId\" = ", "\n      GROUP BY l.type\n    "])), projectId, startDate ? client_1.Prisma.sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["AND \"createdAt\" >= ", ""], ["AND \"createdAt\" >= ", ""])), startDate) : client_1.Prisma.empty, projectId)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result.map(function (r) { return ({
                                    loader: r.type,
                                    count: Number(r.count),
                                }); })];
                    }
                });
            });
        };
        AnalyticsService_1.prototype.getUniqueVisitors = function (projectId, startDate) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.prisma.$queryRaw(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n      SELECT COUNT(DISTINCT COALESCE(\"userId\", \"ip\")) AS count\n      FROM \"Download\"\n      WHERE \"projectId\" = ", "\n        ", "\n    "], ["\n      SELECT COUNT(DISTINCT COALESCE(\"userId\", \"ip\")) AS count\n      FROM \"Download\"\n      WHERE \"projectId\" = ", "\n        ", "\n    "])), projectId, startDate ? client_1.Prisma.sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["AND \"createdAt\" >= ", ""], ["AND \"createdAt\" >= ", ""])), startDate) : client_1.Prisma.empty)];
                        case 1:
                            result = _c.sent();
                            return [2 /*return*/, Number((_b = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0)];
                    }
                });
            });
        };
        AnalyticsService_1.prototype.getDownloadsTrend = function (startDate) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.$queryRaw(templateObject_10 || (templateObject_10 = __makeTemplateObject(["\n      SELECT DATE(\"createdAt\") AS date, COUNT(*) AS count\n      FROM \"Download\"\n      ", "\n      GROUP BY DATE(\"createdAt\")\n      ORDER BY date ASC\n    "], ["\n      SELECT DATE(\"createdAt\") AS date, COUNT(*) AS count\n      FROM \"Download\"\n      ", "\n      GROUP BY DATE(\"createdAt\")\n      ORDER BY date ASC\n    "])), startDate ? client_1.Prisma.sql(templateObject_9 || (templateObject_9 = __makeTemplateObject(["WHERE \"createdAt\" >= ", ""], ["WHERE \"createdAt\" >= ", ""])), startDate) : client_1.Prisma.empty)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result.map(function (r) { return ({
                                    date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date),
                                    count: Number(r.count),
                                }); })];
                    }
                });
            });
        };
        AnalyticsService_1.prototype.fillDayGaps = function (data, days) {
            var _a;
            var dataMap = new Map();
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var row = data_1[_i];
                var dateStr = row.date instanceof Date ? row.date.toISOString().split('T')[0] : String(row.date);
                dataMap.set(dateStr, Number(row.count));
            }
            var buckets = [];
            for (var i = days - 1; i >= 0; i--) {
                var date = new Date();
                date.setHours(0, 0, 0, 0);
                date.setDate(date.getDate() - i);
                var dateStr = date.toISOString().split('T')[0];
                buckets.push({ date: dateStr, count: (_a = dataMap.get(dateStr)) !== null && _a !== void 0 ? _a : 0 });
            }
            return buckets;
        };
        return AnalyticsService_1;
    }());
    __setFunctionName(_classThis, "AnalyticsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AnalyticsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AnalyticsService = _classThis;
}();
exports.AnalyticsService = AnalyticsService;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10;
