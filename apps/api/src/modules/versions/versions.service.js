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
exports.VersionsService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var pagination_1 = require("../../common/pagination");
var crypto = require("crypto");
var VALID_HASH_ALGORITHMS = ['sha256', 'sha1', 'sha512'];
function algorithmToField(algo) {
    if (algo === 'sha1')
        return 'hashSha1';
    if (algo === 'sha512')
        return 'hashSha512';
    return 'hash';
}
var VersionsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var VersionsService = _classThis = /** @class */ (function () {
        function VersionsService_1(prisma, followsService, analyticsQueue) {
            this.prisma = prisma;
            this.followsService = followsService;
            this.analyticsQueue = analyticsQueue;
            this.logger = new common_1.Logger(VersionsService.name);
        }
        VersionsService_1.prototype.create = function (projectId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var project, existing, requestedStatus, effectiveStatus, version;
                var _this = this;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({ where: { id: projectId } })];
                        case 1:
                            project = _b.sent();
                            if (!project) {
                                throw new common_1.NotFoundException("Project with id \"".concat(projectId, "\" not found"));
                            }
                            return [4 /*yield*/, this.prisma.projectVersion.findUnique({
                                    where: { projectId_version: { projectId: projectId, version: dto.version } },
                                })];
                        case 2:
                            existing = _b.sent();
                            if (existing) {
                                throw new common_1.ConflictException("Version \"".concat(dto.version, "\" already exists for this project"));
                            }
                            requestedStatus = (_a = dto.status) !== null && _a !== void 0 ? _a : client_1.VersionStatus.DRAFT;
                            effectiveStatus = requestedStatus === client_1.VersionStatus.APPROVED
                                ? client_1.VersionStatus.SUBMITTED
                                : requestedStatus;
                            return [4 /*yield*/, this.prisma.projectVersion.create({
                                    data: {
                                        projectId: projectId,
                                        version: dto.version,
                                        changelog: dto.changelog,
                                        fileUrl: dto.fileUrl,
                                        fileSize: dto.fileSize,
                                        hash: dto.hash,
                                        status: effectiveStatus,
                                        scanStatus: client_1.ScanStatus.PENDING,
                                        loaders: {
                                            create: dto.loaders.map(function (type) { return ({
                                                type: type,
                                                projectId: projectId,
                                                versionString: dto.minecraftVersionId,
                                            }); }),
                                        },
                                        dependencies: dto.dependencies
                                            ? {
                                                create: dto.dependencies.map(function (dep) { return ({
                                                    requiredId: dep.projectId,
                                                    dependentId: projectId,
                                                    isRequired: dep.required,
                                                    isOptional: !dep.required,
                                                }); }),
                                            }
                                            : undefined,
                                    },
                                    include: {
                                        loaders: true,
                                        dependencies: {
                                            include: {
                                                required: { select: { id: true, title: true, slug: true } },
                                            },
                                        },
                                    },
                                })];
                        case 3:
                            version = _b.sent();
                            // Notify followers about the new version
                            if (dto.status === client_1.VersionStatus.APPROVED || version.status === client_1.VersionStatus.APPROVED) {
                                this.followsService.notifyFollowers(projectId, dto.version).catch(function (err) {
                                    return _this.logger.warn("Failed to notify followers: ".concat(err.message));
                                });
                            }
                            return [2 /*return*/, this.formatVersion(version)];
                    }
                });
            });
        };
        VersionsService_1.prototype.findAllByProject = function (projectId) {
            return __awaiter(this, void 0, void 0, function () {
                var project, versions;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findFirst({
                                where: { OR: [{ id: projectId }, { slug: projectId }] },
                                select: { id: true },
                            })];
                        case 1:
                            project = _a.sent();
                            if (!project) {
                                throw new common_1.NotFoundException("Project \"".concat(projectId, "\" not found"));
                            }
                            return [4 /*yield*/, this.prisma.projectVersion.findMany({
                                    where: { projectId: project.id },
                                    orderBy: { createdAt: 'desc' },
                                    include: {
                                        loaders: true,
                                        dependencies: {
                                            include: {
                                                required: { select: { id: true, title: true, slug: true } },
                                            },
                                        },
                                    },
                                })];
                        case 2:
                            versions = _a.sent();
                            return [2 /*return*/, versions.map(function (v) { return _this.formatVersion(v); })];
                    }
                });
            });
        };
        /**
         * Resolve a single version by its content hash. Supports sha256 (default),
         * sha1 and sha512 via the `algorithm` parameter. The indexed columns from
         * the latest migration (`hash`, `hashSha1`, `hashSha512`) keep this O(log n).
         */
        VersionsService_1.prototype.getByHash = function (hash_1) {
            return __awaiter(this, arguments, void 0, function (hash, algorithm) {
                var algo, field, version;
                var _a;
                if (algorithm === void 0) { algorithm = 'sha256'; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            algo = VALID_HASH_ALGORITHMS.includes(algorithm)
                                ? algorithm
                                : 'sha256';
                            field = algorithmToField(algo);
                            return [4 /*yield*/, this.prisma.projectVersion.findFirst({
                                    where: (_a = {}, _a[field] = hash, _a),
                                    include: {
                                        loaders: true,
                                        dependencies: {
                                            include: {
                                                required: { select: { id: true, title: true, slug: true } },
                                            },
                                        },
                                        project: { select: { id: true, title: true, slug: true } },
                                    },
                                })];
                        case 1:
                            version = _b.sent();
                            if (!version) {
                                throw new common_1.NotFoundException("Version with ".concat(algo, " hash \"").concat(hash, "\" not found"));
                            }
                            return [2 /*return*/, this.formatVersion(version)];
                    }
                });
            });
        };
        /**
         * Given a content hash and optional loader / game-version filters, return
         * the most recent matching version. Modrinth parity — launcher integrators
         * call this to confirm a file is up-to-date.
         */
        VersionsService_1.prototype.getLatestByHash = function (hash, loaders, gameVersions) {
            return __awaiter(this, void 0, void 0, function () {
                var baseMatch, projectId, versionsForProject, latest;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.projectVersion.findFirst({
                                where: { hash: hash },
                                include: {
                                    loaders: true,
                                    project: { select: { id: true, title: true, slug: true } },
                                },
                            })];
                        case 1:
                            baseMatch = _b.sent();
                            if (!baseMatch) {
                                throw new common_1.NotFoundException("Version with sha256 hash \"".concat(hash, "\" not found"));
                            }
                            projectId = baseMatch.projectId;
                            return [4 /*yield*/, this.prisma.projectVersion.findMany({
                                    where: __assign(__assign({ projectId: projectId, status: client_1.VersionStatus.APPROVED }, ((loaders === null || loaders === void 0 ? void 0 : loaders.length)
                                        ? { loaders: { some: { type: { in: loaders } } } }
                                        : {})), ((gameVersions === null || gameVersions === void 0 ? void 0 : gameVersions.length)
                                        ? { loaders: { some: { versionString: { in: gameVersions } } } }
                                        : {})),
                                    orderBy: { createdAt: 'desc' },
                                    include: {
                                        loaders: true,
                                        project: { select: { id: true, title: true, slug: true } },
                                    },
                                })];
                        case 2:
                            versionsForProject = _b.sent();
                            latest = (_a = versionsForProject[0]) !== null && _a !== void 0 ? _a : baseMatch;
                            return [2 /*return*/, this.formatVersion(latest)];
                    }
                });
            });
        };
        /**
         * Bulk version lookup by primary key. Missing ids are silently dropped to
         * match Modrinth/CurseForge behavior.
         */
        VersionsService_1.prototype.findByIds = function (ids) {
            return __awaiter(this, void 0, void 0, function () {
                var versions;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!ids.length)
                                return [2 /*return*/, []];
                            return [4 /*yield*/, this.prisma.projectVersion.findMany({
                                    where: { id: { in: ids } },
                                    include: {
                                        loaders: true,
                                        project: { select: { id: true, title: true, slug: true } },
                                    },
                                })];
                        case 1:
                            versions = _a.sent();
                            return [2 /*return*/, versions.map(function (v) { return _this.formatVersion(v); })];
                    }
                });
            });
        };
        /**
         * Bulk lookup keyed by content hash. Returns a map so callers can correlate
         * results back to their input list; missing hashes are simply absent.
         */
        VersionsService_1.prototype.getBulkByHashes = function (hashes_1) {
            return __awaiter(this, arguments, void 0, function (hashes, algorithm) {
                var algo, field, versions, out, _i, versions_1, v, key;
                var _a;
                if (algorithm === void 0) { algorithm = 'sha256'; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!hashes.length)
                                return [2 /*return*/, {}];
                            algo = VALID_HASH_ALGORITHMS.includes(algorithm)
                                ? algorithm
                                : 'sha256';
                            field = algorithmToField(algo);
                            return [4 /*yield*/, this.prisma.projectVersion.findMany({
                                    where: (_a = {}, _a[field] = { in: hashes }, _a),
                                    include: {
                                        loaders: true,
                                        project: { select: { id: true, title: true, slug: true } },
                                    },
                                })];
                        case 1:
                            versions = _b.sent();
                            out = {};
                            for (_i = 0, versions_1 = versions; _i < versions_1.length; _i++) {
                                v = versions_1[_i];
                                key = v[field];
                                if (key)
                                    out[key] = this.formatVersion(v);
                            }
                            return [2 /*return*/, out];
                    }
                });
            });
        };
        /** Cursor-based listing of versions for a project (newest first). */
        VersionsService_1.prototype.findAllByProjectCursor = function (projectId_1) {
            return __awaiter(this, arguments, void 0, function (projectId, options) {
                var project;
                var _this = this;
                var _a;
                if (options === void 0) { options = {}; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findFirst({
                                where: { OR: [{ id: projectId }, { slug: projectId }] },
                                select: { id: true },
                            })];
                        case 1:
                            project = _b.sent();
                            if (!project)
                                throw new common_1.NotFoundException("Project \"".concat(projectId, "\" not found"));
                            return [2 /*return*/, (0, pagination_1.paginateCursor)({
                                    take: (_a = options.limit) !== null && _a !== void 0 ? _a : 20,
                                    cursor: options.cursor,
                                    where: { projectId: project.id },
                                    orderBy: { createdAt: 'desc' },
                                    prismaDelegate: {
                                        findMany: function (args) { return _this.prisma.projectVersion.findMany(__assign(__assign({}, args), { include: {
                                                loaders: true,
                                                project: { select: { id: true, title: true, slug: true } },
                                            } })); },
                                    },
                                }).then(function (page) { return (__assign(__assign({}, page), { data: page.data.map(function (v) { return _this.formatVersion(v); }) })); })];
                    }
                });
            });
        };
        VersionsService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var version;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.projectVersion.findUnique({
                                where: { id: id },
                                include: {
                                    loaders: true,
                                    dependencies: {
                                        include: {
                                            required: { select: { id: true, title: true, slug: true } },
                                        },
                                    },
                                    project: { select: { id: true, title: true, slug: true } },
                                },
                            })];
                        case 1:
                            version = _a.sent();
                            if (!version) {
                                throw new common_1.NotFoundException("Version with id \"".concat(id, "\" not found"));
                            }
                            return [2 /*return*/, this.formatVersion(version)];
                    }
                });
            });
        };
        VersionsService_1.prototype.update = function (id, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var existing, updateData, version;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.projectVersion.findUnique({ where: { id: id } })];
                        case 1:
                            existing = _a.sent();
                            if (!existing) {
                                throw new common_1.NotFoundException("Version with id \"".concat(id, "\" not found"));
                            }
                            updateData = {};
                            if (dto.version !== undefined)
                                updateData.version = dto.version;
                            if (dto.changelog !== undefined)
                                updateData.changelog = dto.changelog;
                            if (dto.fileUrl !== undefined)
                                updateData.fileUrl = dto.fileUrl;
                            if (dto.fileSize !== undefined)
                                updateData.fileSize = dto.fileSize;
                            if (dto.hash !== undefined)
                                updateData.hash = dto.hash;
                            if (dto.status !== undefined)
                                updateData.status = dto.status;
                            return [4 /*yield*/, this.prisma.projectVersion.update({
                                    where: { id: id },
                                    data: updateData,
                                    include: {
                                        loaders: true,
                                        dependencies: {
                                            include: {
                                                required: { select: { id: true, title: true, slug: true } },
                                            },
                                        },
                                    },
                                })];
                        case 2:
                            version = _a.sent();
                            return [2 /*return*/, this.formatVersion(version)];
                    }
                });
            });
        };
        VersionsService_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var existing;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.projectVersion.findUnique({ where: { id: id } })];
                        case 1:
                            existing = _a.sent();
                            if (!existing) {
                                throw new common_1.NotFoundException("Version with id \"".concat(id, "\" not found"));
                            }
                            return [4 /*yield*/, this.prisma.$transaction([
                                    this.prisma.loader.deleteMany({ where: { versionId: id } }),
                                    this.prisma.dependency.deleteMany({ where: { versionId: id } }),
                                    this.prisma.download.deleteMany({ where: { versionId: id } }),
                                    this.prisma.projectVersion.delete({ where: { id: id } }),
                                ])];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        VersionsService_1.prototype.incrementDownloads = function (id, ip, userAgent, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var version, hashedIp;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.projectVersion.findUnique({
                                where: { id: id },
                                select: { id: true, fileUrl: true, hash: true, projectId: true },
                            })];
                        case 1:
                            version = _a.sent();
                            if (!version) {
                                throw new common_1.NotFoundException("Version with id \"".concat(id, "\" not found"));
                            }
                            hashedIp = ip ? crypto.createHash('sha256').update(ip).digest('hex') : null;
                            return [4 /*yield*/, this.prisma.$transaction([
                                    this.prisma.projectVersion.update({
                                        where: { id: id },
                                        data: { downloads: { increment: 1 } },
                                    }),
                                    this.prisma.project.update({
                                        where: { id: version.projectId },
                                        data: { downloads: { increment: 1 } },
                                    }),
                                    this.prisma.download.create({
                                        data: {
                                            projectId: version.projectId,
                                            versionId: id,
                                            ip: hashedIp,
                                            userAgent: userAgent,
                                            userId: userId,
                                        },
                                    }),
                                ])];
                        case 2:
                            _a.sent();
                            this.analyticsQueue.add('download', { projectId: version.projectId, versionId: id, userId: userId }).catch(function (err) {
                                return _this.logger.warn("Failed to enqueue analytics: ".concat(err.message));
                            });
                            return [2 /*return*/, { fileUrl: version.fileUrl, hash: version.hash, projectId: version.projectId }];
                    }
                });
            });
        };
        VersionsService_1.generateFileHash = function (buffer) {
            var hash = crypto.createHash('sha256').update(buffer).digest('hex');
            return "sha256:".concat(hash);
        };
        VersionsService_1.prototype.formatVersion = function (version) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            var minecraftVersion = (_c = (_b = (_a = version.loaders) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.versionString) !== null && _c !== void 0 ? _c : '';
            return {
                id: version.id,
                version: version.version,
                changelog: (_d = version.changelog) !== null && _d !== void 0 ? _d : undefined,
                fileUrl: version.fileUrl,
                fileSize: version.fileSize,
                hash: version.hash,
                downloads: version.downloads,
                status: version.status,
                scanStatus: version.scanStatus,
                projectId: version.projectId,
                minecraftVersion: minecraftVersion,
                createdAt: version.createdAt instanceof Date ? version.createdAt.toISOString() : version.createdAt,
                updatedAt: version.updatedAt instanceof Date ? version.updatedAt.toISOString() : version.updatedAt,
                loaders: (_f = (_e = version.loaders) === null || _e === void 0 ? void 0 : _e.map(function (l) { return l.type; })) !== null && _f !== void 0 ? _f : [],
                dependencies: (_h = (_g = version.dependencies) === null || _g === void 0 ? void 0 : _g.map(function (d) {
                    var _a;
                    return ({
                        id: d.required.id,
                        name: d.required.title,
                        slug: d.required.slug,
                        required: (_a = d.isRequired) !== null && _a !== void 0 ? _a : !d.isOptional,
                    });
                })) !== null && _h !== void 0 ? _h : [],
                project: version.project,
            };
        };
        return VersionsService_1;
    }());
    __setFunctionName(_classThis, "VersionsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        VersionsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return VersionsService = _classThis;
}();
exports.VersionsService = VersionsService;
