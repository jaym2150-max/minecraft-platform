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
exports.VersionsHashCompatController = exports.VersionFilesController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
var scopes_guard_1 = require("../../common/guards/scopes.guard");
var scopes_decorator_1 = require("../../common/decorators/scopes.decorator");
var public_decorator_1 = require("../../common/decorators/public.decorator");
var client_1 = require("@prisma/client");
var class_validator_1 = require("class-validator");
var BulkLookupDto = function () {
    var _a;
    var _hashes_decorators;
    var _hashes_initializers = [];
    var _hashes_extraInitializers = [];
    var _algorithm_decorators;
    var _algorithm_initializers = [];
    var _algorithm_extraInitializers = [];
    return _a = /** @class */ (function () {
            function BulkLookupDto() {
                this.hashes = __runInitializers(this, _hashes_initializers, void 0);
                this.algorithm = (__runInitializers(this, _hashes_extraInitializers), __runInitializers(this, _algorithm_initializers, void 0));
                __runInitializers(this, _algorithm_extraInitializers);
            }
            return BulkLookupDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _hashes_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.ArrayMaxSize)(200), (0, class_validator_1.IsString)({ each: true })];
            _algorithm_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(['sha256', 'sha1', 'sha512'])];
            __esDecorate(null, null, _hashes_decorators, { kind: "field", name: "hashes", static: false, private: false, access: { has: function (obj) { return "hashes" in obj; }, get: function (obj) { return obj.hashes; }, set: function (obj, value) { obj.hashes = value; } }, metadata: _metadata }, _hashes_initializers, _hashes_extraInitializers);
            __esDecorate(null, null, _algorithm_decorators, { kind: "field", name: "algorithm", static: false, private: false, access: { has: function (obj) { return "algorithm" in obj; }, get: function (obj) { return obj.algorithm; }, set: function (obj, value) { obj.algorithm = value; } }, metadata: _metadata }, _algorithm_initializers, _algorithm_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
/**
 * Modrinth-compatible hash-based version-file endpoints. These power launcher
 * integrations: a launcher uploads a file, hashes it, then asks the API
 * "what is this file?" via the hash.
 *
 * Endpoints:
 *  - GET  /version-files/:hash                 lookup by content hash
 *  - GET  /version-files/latest?hash=...       latest matching version
 *  - POST /version-files/bulk                  bulk lookup, body { hashes, algorithm }
 *  - GET  /versions/hash/:hash                 legacy alias
 *  - GET  /versions/latest?hash=...            legacy alias
 */
var VersionFilesController = function () {
    var _classDecorators = [(0, common_1.Controller)('version-files')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getLatest_decorators;
    var _getByHash_decorators;
    var _bulk_decorators;
    var VersionFilesController = _classThis = /** @class */ (function () {
        function VersionFilesController_1(versionsService) {
            this.versionsService = (__runInitializers(this, _instanceExtraInitializers), versionsService);
        }
        VersionFilesController_1.prototype.getLatest = function (hash, loaders, gameVersions) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!hash) {
                                return [2 /*return*/, {
                                        statusCode: common_1.HttpStatus.BAD_REQUEST,
                                        message: 'Query parameter "hash" is required',
                                        data: null,
                                        timestamp: new Date().toISOString(),
                                    }];
                            }
                            return [4 /*yield*/, this.versionsService.getLatestByHash(hash, loaders ? loaders.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : undefined, gameVersions ? gameVersions.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : undefined)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Latest matching version retrieved successfully',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        VersionFilesController_1.prototype.getByHash = function (hash, algorithm) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.versionsService.getByHash(hash, algorithm !== null && algorithm !== void 0 ? algorithm : 'sha256')];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Version retrieved successfully',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        VersionFilesController_1.prototype.bulk = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.versionsService.getBulkByHashes(dto.hashes, (_a = dto.algorithm) !== null && _a !== void 0 ? _a : 'sha256')];
                        case 1:
                            data = _b.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Bulk lookup completed',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        return VersionFilesController_1;
    }());
    __setFunctionName(_classThis, "VersionFilesController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getLatest_decorators = [(0, common_1.Get)('latest'), (0, public_decorator_1.Public)(), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _getByHash_decorators = [(0, common_1.Get)(':hash'), (0, public_decorator_1.Public)(), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _bulk_decorators = [(0, common_1.Post)('bulk'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, scopes_guard_1.ScopesGuard), (0, scopes_decorator_1.Scopes)(client_1.ApiKeyScope.VERSION_READ, client_1.ApiKeyScope.PROJECT_READ, client_1.ApiKeyScope.READ), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        __esDecorate(_classThis, null, _getLatest_decorators, { kind: "method", name: "getLatest", static: false, private: false, access: { has: function (obj) { return "getLatest" in obj; }, get: function (obj) { return obj.getLatest; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getByHash_decorators, { kind: "method", name: "getByHash", static: false, private: false, access: { has: function (obj) { return "getByHash" in obj; }, get: function (obj) { return obj.getByHash; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _bulk_decorators, { kind: "method", name: "bulk", static: false, private: false, access: { has: function (obj) { return "bulk" in obj; }, get: function (obj) { return obj.bulk; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        VersionFilesController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return VersionFilesController = _classThis;
}();
exports.VersionFilesController = VersionFilesController;
/**
 * Legacy aliases under `/versions/*` to match the older Modrinth API
 * surface. Same handlers, different paths. The `latest` and `hash/:hash`
 * routes are defined BEFORE the `:id` catch-all on VersionByIdController,
 * so we give these aliases explicit paths that can't be shadowed.
 */
var VersionsHashCompatController = function () {
    var _classDecorators = [(0, common_1.Controller)('versions')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getByHash_decorators;
    var _getLatest_decorators;
    var VersionsHashCompatController = _classThis = /** @class */ (function () {
        function VersionsHashCompatController_1(versionsService) {
            this.versionsService = (__runInitializers(this, _instanceExtraInitializers), versionsService);
        }
        VersionsHashCompatController_1.prototype.getByHash = function (hash, algorithm) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.versionsService.getByHash(hash, algorithm !== null && algorithm !== void 0 ? algorithm : 'sha256')];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Version retrieved successfully',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        VersionsHashCompatController_1.prototype.getLatest = function (hash, loaders, gameVersions) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!hash) {
                                return [2 /*return*/, {
                                        statusCode: common_1.HttpStatus.BAD_REQUEST,
                                        message: 'Query parameter "hash" is required',
                                        data: null,
                                        timestamp: new Date().toISOString(),
                                    }];
                            }
                            return [4 /*yield*/, this.versionsService.getLatestByHash(hash, loaders ? loaders.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : undefined, gameVersions ? gameVersions.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : undefined)];
                        case 1:
                            data = _a.sent();
                            return [2 /*return*/, {
                                    statusCode: common_1.HttpStatus.OK,
                                    message: 'Latest matching version retrieved successfully',
                                    data: data,
                                    timestamp: new Date().toISOString(),
                                }];
                    }
                });
            });
        };
        return VersionsHashCompatController_1;
    }());
    __setFunctionName(_classThis, "VersionsHashCompatController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getByHash_decorators = [(0, common_1.Get)('hash-by-id/:hash'), (0, public_decorator_1.Public)(), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _getLatest_decorators = [(0, common_1.Get)('latest-by-hash'), (0, public_decorator_1.Public)(), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        __esDecorate(_classThis, null, _getByHash_decorators, { kind: "method", name: "getByHash", static: false, private: false, access: { has: function (obj) { return "getByHash" in obj; }, get: function (obj) { return obj.getByHash; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getLatest_decorators, { kind: "method", name: "getLatest", static: false, private: false, access: { has: function (obj) { return "getLatest" in obj; }, get: function (obj) { return obj.getLatest; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        VersionsHashCompatController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return VersionsHashCompatController = _classThis;
}();
exports.VersionsHashCompatController = VersionsHashCompatController;
