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
exports.CreateProjectDto = void 0;
var class_validator_1 = require("class-validator");
var types_1 = require("@mcp/types");
var CreateProjectDto = function () {
    var _a;
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _body_decorators;
    var _body_initializers = [];
    var _body_extraInitializers = [];
    var _iconUrl_decorators;
    var _iconUrl_initializers = [];
    var _iconUrl_extraInitializers = [];
    var _coverUrl_decorators;
    var _coverUrl_initializers = [];
    var _coverUrl_extraInitializers = [];
    var _sourceUrl_decorators;
    var _sourceUrl_initializers = [];
    var _sourceUrl_extraInitializers = [];
    var _discordUrl_decorators;
    var _discordUrl_initializers = [];
    var _discordUrl_extraInitializers = [];
    var _wikiUrl_decorators;
    var _wikiUrl_initializers = [];
    var _wikiUrl_extraInitializers = [];
    var _clientSide_decorators;
    var _clientSide_initializers = [];
    var _clientSide_extraInitializers = [];
    var _serverSide_decorators;
    var _serverSide_initializers = [];
    var _serverSide_extraInitializers = [];
    var _categoryId_decorators;
    var _categoryId_initializers = [];
    var _categoryId_extraInitializers = [];
    var _loaders_decorators;
    var _loaders_initializers = [];
    var _loaders_extraInitializers = [];
    var _projectType_decorators;
    var _projectType_initializers = [];
    var _projectType_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateProjectDto() {
                this.title = __runInitializers(this, _title_initializers, void 0);
                this.description = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.body = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _body_initializers, void 0));
                this.iconUrl = (__runInitializers(this, _body_extraInitializers), __runInitializers(this, _iconUrl_initializers, void 0));
                this.coverUrl = (__runInitializers(this, _iconUrl_extraInitializers), __runInitializers(this, _coverUrl_initializers, void 0));
                this.sourceUrl = (__runInitializers(this, _coverUrl_extraInitializers), __runInitializers(this, _sourceUrl_initializers, void 0));
                this.discordUrl = (__runInitializers(this, _sourceUrl_extraInitializers), __runInitializers(this, _discordUrl_initializers, void 0));
                this.wikiUrl = (__runInitializers(this, _discordUrl_extraInitializers), __runInitializers(this, _wikiUrl_initializers, void 0));
                this.clientSide = (__runInitializers(this, _wikiUrl_extraInitializers), __runInitializers(this, _clientSide_initializers, void 0));
                this.serverSide = (__runInitializers(this, _clientSide_extraInitializers), __runInitializers(this, _serverSide_initializers, void 0));
                this.categoryId = (__runInitializers(this, _serverSide_extraInitializers), __runInitializers(this, _categoryId_initializers, void 0));
                this.loaders = (__runInitializers(this, _categoryId_extraInitializers), __runInitializers(this, _loaders_initializers, void 0));
                this.projectType = (__runInitializers(this, _loaders_extraInitializers), __runInitializers(this, _projectType_initializers, void 0));
                __runInitializers(this, _projectType_extraInitializers);
            }
            return CreateProjectDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _title_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _description_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)()];
            _body_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _iconUrl_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _coverUrl_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _sourceUrl_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _discordUrl_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _wikiUrl_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _clientSide_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _serverSide_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _categoryId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUUID)()];
            _loaders_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsEnum)(types_1.LoaderType, { each: true })];
            _projectType_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(types_1.ProjectType)];
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _body_decorators, { kind: "field", name: "body", static: false, private: false, access: { has: function (obj) { return "body" in obj; }, get: function (obj) { return obj.body; }, set: function (obj, value) { obj.body = value; } }, metadata: _metadata }, _body_initializers, _body_extraInitializers);
            __esDecorate(null, null, _iconUrl_decorators, { kind: "field", name: "iconUrl", static: false, private: false, access: { has: function (obj) { return "iconUrl" in obj; }, get: function (obj) { return obj.iconUrl; }, set: function (obj, value) { obj.iconUrl = value; } }, metadata: _metadata }, _iconUrl_initializers, _iconUrl_extraInitializers);
            __esDecorate(null, null, _coverUrl_decorators, { kind: "field", name: "coverUrl", static: false, private: false, access: { has: function (obj) { return "coverUrl" in obj; }, get: function (obj) { return obj.coverUrl; }, set: function (obj, value) { obj.coverUrl = value; } }, metadata: _metadata }, _coverUrl_initializers, _coverUrl_extraInitializers);
            __esDecorate(null, null, _sourceUrl_decorators, { kind: "field", name: "sourceUrl", static: false, private: false, access: { has: function (obj) { return "sourceUrl" in obj; }, get: function (obj) { return obj.sourceUrl; }, set: function (obj, value) { obj.sourceUrl = value; } }, metadata: _metadata }, _sourceUrl_initializers, _sourceUrl_extraInitializers);
            __esDecorate(null, null, _discordUrl_decorators, { kind: "field", name: "discordUrl", static: false, private: false, access: { has: function (obj) { return "discordUrl" in obj; }, get: function (obj) { return obj.discordUrl; }, set: function (obj, value) { obj.discordUrl = value; } }, metadata: _metadata }, _discordUrl_initializers, _discordUrl_extraInitializers);
            __esDecorate(null, null, _wikiUrl_decorators, { kind: "field", name: "wikiUrl", static: false, private: false, access: { has: function (obj) { return "wikiUrl" in obj; }, get: function (obj) { return obj.wikiUrl; }, set: function (obj, value) { obj.wikiUrl = value; } }, metadata: _metadata }, _wikiUrl_initializers, _wikiUrl_extraInitializers);
            __esDecorate(null, null, _clientSide_decorators, { kind: "field", name: "clientSide", static: false, private: false, access: { has: function (obj) { return "clientSide" in obj; }, get: function (obj) { return obj.clientSide; }, set: function (obj, value) { obj.clientSide = value; } }, metadata: _metadata }, _clientSide_initializers, _clientSide_extraInitializers);
            __esDecorate(null, null, _serverSide_decorators, { kind: "field", name: "serverSide", static: false, private: false, access: { has: function (obj) { return "serverSide" in obj; }, get: function (obj) { return obj.serverSide; }, set: function (obj, value) { obj.serverSide = value; } }, metadata: _metadata }, _serverSide_initializers, _serverSide_extraInitializers);
            __esDecorate(null, null, _categoryId_decorators, { kind: "field", name: "categoryId", static: false, private: false, access: { has: function (obj) { return "categoryId" in obj; }, get: function (obj) { return obj.categoryId; }, set: function (obj, value) { obj.categoryId = value; } }, metadata: _metadata }, _categoryId_initializers, _categoryId_extraInitializers);
            __esDecorate(null, null, _loaders_decorators, { kind: "field", name: "loaders", static: false, private: false, access: { has: function (obj) { return "loaders" in obj; }, get: function (obj) { return obj.loaders; }, set: function (obj, value) { obj.loaders = value; } }, metadata: _metadata }, _loaders_initializers, _loaders_extraInitializers);
            __esDecorate(null, null, _projectType_decorators, { kind: "field", name: "projectType", static: false, private: false, access: { has: function (obj) { return "projectType" in obj; }, get: function (obj) { return obj.projectType; }, set: function (obj, value) { obj.projectType = value; } }, metadata: _metadata }, _projectType_initializers, _projectType_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateProjectDto = CreateProjectDto;
