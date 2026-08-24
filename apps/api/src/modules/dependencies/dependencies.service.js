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
exports.DependenciesService = void 0;
var common_1 = require("@nestjs/common");
var DependenciesService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var DependenciesService = _classThis = /** @class */ (function () {
        function DependenciesService_1(prisma) {
            this.prisma = prisma;
            this.logger = new common_1.Logger(DependenciesService.name);
        }
        DependenciesService_1.prototype.findByProject = function (projectId) {
            return __awaiter(this, void 0, void 0, function () {
                var project, dependencies;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({ where: { id: projectId } })];
                        case 1:
                            project = _a.sent();
                            if (!project) {
                                throw new common_1.NotFoundException("Project with id \"".concat(projectId, "\" not found"));
                            }
                            return [4 /*yield*/, this.prisma.dependency.findMany({
                                    where: { dependentId: projectId },
                                    include: {
                                        required: {
                                            select: { id: true, title: true, slug: true, iconUrl: true, status: true },
                                        },
                                        version: { select: { id: true, version: true } },
                                    },
                                })];
                        case 2:
                            dependencies = _a.sent();
                            return [2 /*return*/, dependencies.map(function (d) { return ({
                                    id: d.id,
                                    requiredProject: d.required,
                                    version: d.version,
                                    isRequired: d.isRequired,
                                    isOptional: d.isOptional,
                                    createdAt: d.createdAt.toISOString(),
                                }); })];
                    }
                });
            });
        };
        DependenciesService_1.prototype.create = function (dependentId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var dependent, required, existing, dependency;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({ where: { id: dependentId } })];
                        case 1:
                            dependent = _c.sent();
                            if (!dependent) {
                                throw new common_1.NotFoundException("Project with id \"".concat(dependentId, "\" not found"));
                            }
                            return [4 /*yield*/, this.prisma.project.findUnique({ where: { id: dto.requiredId } })];
                        case 2:
                            required = _c.sent();
                            if (!required) {
                                throw new common_1.NotFoundException("Required project with id \"".concat(dto.requiredId, "\" not found"));
                            }
                            if (dependentId === dto.requiredId) {
                                throw new common_1.ConflictException('A project cannot depend on itself');
                            }
                            return [4 /*yield*/, this.prisma.dependency.findFirst({
                                    where: { dependentId: dependentId, requiredId: dto.requiredId },
                                })];
                        case 3:
                            existing = _c.sent();
                            if (existing) {
                                throw new common_1.ConflictException('This dependency already exists');
                            }
                            return [4 /*yield*/, this.prisma.dependency.create({
                                    data: {
                                        dependentId: dependentId,
                                        requiredId: dto.requiredId,
                                        versionId: dto.versionId,
                                        isRequired: (_a = dto.isRequired) !== null && _a !== void 0 ? _a : !dto.isOptional,
                                        isOptional: (_b = dto.isOptional) !== null && _b !== void 0 ? _b : !dto.isRequired,
                                    },
                                    include: {
                                        required: {
                                            select: { id: true, title: true, slug: true, iconUrl: true },
                                        },
                                    },
                                })];
                        case 4:
                            dependency = _c.sent();
                            return [2 /*return*/, dependency];
                    }
                });
            });
        };
        DependenciesService_1.prototype.update = function (id, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var existing, data, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.dependency.findUnique({ where: { id: id } })];
                        case 1:
                            existing = _a.sent();
                            if (!existing) {
                                throw new common_1.NotFoundException("Dependency with id \"".concat(id, "\" not found"));
                            }
                            data = {};
                            if (dto.isRequired !== undefined)
                                data.isRequired = dto.isRequired;
                            if (dto.isOptional !== undefined)
                                data.isOptional = dto.isOptional;
                            return [4 /*yield*/, this.prisma.dependency.update({
                                    where: { id: id },
                                    data: data,
                                    include: {
                                        required: {
                                            select: { id: true, title: true, slug: true, iconUrl: true },
                                        },
                                    },
                                })];
                        case 2:
                            updated = _a.sent();
                            return [2 /*return*/, updated];
                    }
                });
            });
        };
        DependenciesService_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var existing;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.dependency.findUnique({ where: { id: id } })];
                        case 1:
                            existing = _a.sent();
                            if (!existing) {
                                throw new common_1.NotFoundException("Dependency with id \"".concat(id, "\" not found"));
                            }
                            return [4 /*yield*/, this.prisma.dependency.delete({ where: { id: id } })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return DependenciesService_1;
    }());
    __setFunctionName(_classThis, "DependenciesService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DependenciesService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DependenciesService = _classThis;
}();
exports.DependenciesService = DependenciesService;
