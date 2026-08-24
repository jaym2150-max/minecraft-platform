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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVersionDto = void 0;
var class_validator_1 = require("class-validator");
var client_1 = require("@prisma/client");
var CreateVersionDto = function () {
    var _a;
    var _version_decorators;
    var _version_initializers = [];
    var _version_extraInitializers = [];
    var _changelog_decorators;
    var _changelog_initializers = [];
    var _changelog_extraInitializers = [];
    var _fileUrl_decorators;
    var _fileUrl_initializers = [];
    var _fileUrl_extraInitializers = [];
    var _fileSize_decorators;
    var _fileSize_initializers = [];
    var _fileSize_extraInitializers = [];
    var _hash_decorators;
    var _hash_initializers = [];
    var _hash_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _loaders_decorators;
    var _loaders_initializers = [];
    var _loaders_extraInitializers = [];
    var _minecraftVersionId_decorators;
    var _minecraftVersionId_initializers = [];
    var _minecraftVersionId_extraInitializers = [];
    var _dependencies_decorators;
    var _dependencies_initializers = [];
    var _dependencies_extraInitializers = [];
    var _clientSide_decorators;
    var _clientSide_initializers = [];
    var _clientSide_extraInitializers = [];
    var _serverSide_decorators;
    var _serverSide_initializers = [];
    var _serverSide_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateVersionDto() {
                this.version = __runInitializers(this, _version_initializers, void 0);
                this.changelog = (__runInitializers(this, _version_extraInitializers), __runInitializers(this, _changelog_initializers, void 0));
                this.fileUrl = (__runInitializers(this, _changelog_extraInitializers), __runInitializers(this, _fileUrl_initializers, void 0));
                this.fileSize = (__runInitializers(this, _fileUrl_extraInitializers), __runInitializers(this, _fileSize_initializers, void 0));
                this.hash = (__runInitializers(this, _fileSize_extraInitializers), __runInitializers(this, _hash_initializers, void 0));
                this.status = (__runInitializers(this, _hash_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                this.loaders = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _loaders_initializers, void 0));
                this.minecraftVersionId = (__runInitializers(this, _loaders_extraInitializers), __runInitializers(this, _minecraftVersionId_initializers, void 0));
                this.dependencies = (__runInitializers(this, _minecraftVersionId_extraInitializers), __runInitializers(this, _dependencies_initializers, void 0));
                this.clientSide = (__runInitializers(this, _dependencies_extraInitializers), __runInitializers(this, _clientSide_initializers, void 0));
                this.serverSide = (__runInitializers(this, _clientSide_extraInitializers), __runInitializers(this, _serverSide_initializers, void 0));
                __runInitializers(this, _serverSide_extraInitializers);
            }
            return CreateVersionDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _version_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1, { message: 'Version string is required' })];
            _changelog_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _fileUrl_decorators = [(0, class_validator_1.IsUrl)({}, { message: 'File URL must be a valid URL' })];
            _fileSize_decorators = [(0, class_validator_1.IsNumber)()];
            _hash_decorators = [(0, class_validator_1.IsString)()];
            _status_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(client_1.VersionStatus)];
            _loaders_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.IsEnum)(client_1.LoaderType, { each: true })];
            _minecraftVersionId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _dependencies_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)()];
            _clientSide_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _serverSide_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _version_decorators, { kind: "field", name: "version", static: false, private: false, access: { has: function (obj) { return "version" in obj; }, get: function (obj) { return obj.version; }, set: function (obj, value) { obj.version = value; } }, metadata: _metadata }, _version_initializers, _version_extraInitializers);
            __esDecorate(null, null, _changelog_decorators, { kind: "field", name: "changelog", static: false, private: false, access: { has: function (obj) { return "changelog" in obj; }, get: function (obj) { return obj.changelog; }, set: function (obj, value) { obj.changelog = value; } }, metadata: _metadata }, _changelog_initializers, _changelog_extraInitializers);
            __esDecorate(null, null, _fileUrl_decorators, { kind: "field", name: "fileUrl", static: false, private: false, access: { has: function (obj) { return "fileUrl" in obj; }, get: function (obj) { return obj.fileUrl; }, set: function (obj, value) { obj.fileUrl = value; } }, metadata: _metadata }, _fileUrl_initializers, _fileUrl_extraInitializers);
            __esDecorate(null, null, _fileSize_decorators, { kind: "field", name: "fileSize", static: false, private: false, access: { has: function (obj) { return "fileSize" in obj; }, get: function (obj) { return obj.fileSize; }, set: function (obj, value) { obj.fileSize = value; } }, metadata: _metadata }, _fileSize_initializers, _fileSize_extraInitializers);
            __esDecorate(null, null, _hash_decorators, { kind: "field", name: "hash", static: false, private: false, access: { has: function (obj) { return "hash" in obj; }, get: function (obj) { return obj.hash; }, set: function (obj, value) { obj.hash = value; } }, metadata: _metadata }, _hash_initializers, _hash_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _loaders_decorators, { kind: "field", name: "loaders", static: false, private: false, access: { has: function (obj) { return "loaders" in obj; }, get: function (obj) { return obj.loaders; }, set: function (obj, value) { obj.loaders = value; } }, metadata: _metadata }, _loaders_initializers, _loaders_extraInitializers);
            __esDecorate(null, null, _minecraftVersionId_decorators, { kind: "field", name: "minecraftVersionId", static: false, private: false, access: { has: function (obj) { return "minecraftVersionId" in obj; }, get: function (obj) { return obj.minecraftVersionId; }, set: function (obj, value) { obj.minecraftVersionId = value; } }, metadata: _metadata }, _minecraftVersionId_initializers, _minecraftVersionId_extraInitializers);
            __esDecorate(null, null, _dependencies_decorators, { kind: "field", name: "dependencies", static: false, private: false, access: { has: function (obj) { return "dependencies" in obj; }, get: function (obj) { return obj.dependencies; }, set: function (obj, value) { obj.dependencies = value; } }, metadata: _metadata }, _dependencies_initializers, _dependencies_extraInitializers);
            __esDecorate(null, null, _clientSide_decorators, { kind: "field", name: "clientSide", static: false, private: false, access: { has: function (obj) { return "clientSide" in obj; }, get: function (obj) { return obj.clientSide; }, set: function (obj, value) { obj.clientSide = value; } }, metadata: _metadata }, _clientSide_initializers, _clientSide_extraInitializers);
            __esDecorate(null, null, _serverSide_decorators, { kind: "field", name: "serverSide", static: false, private: false, access: { has: function (obj) { return "serverSide" in obj; }, get: function (obj) { return obj.serverSide; }, set: function (obj, value) { obj.serverSide = value; } }, metadata: _metadata }, _serverSide_initializers, _serverSide_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateVersionDto = CreateVersionDto;
