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
exports.CreateLoaderDto = void 0;
var class_validator_1 = require("class-validator");
var client_1 = require("@prisma/client");
var CreateLoaderDto = function () {
    var _a;
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _versionString_decorators;
    var _versionString_initializers = [];
    var _versionString_extraInitializers = [];
    var _projectId_decorators;
    var _projectId_initializers = [];
    var _projectId_extraInitializers = [];
    var _versionId_decorators;
    var _versionId_initializers = [];
    var _versionId_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateLoaderDto() {
                this.type = __runInitializers(this, _type_initializers, void 0);
                this.versionString = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _versionString_initializers, void 0));
                this.projectId = (__runInitializers(this, _versionString_extraInitializers), __runInitializers(this, _projectId_initializers, void 0));
                this.versionId = (__runInitializers(this, _projectId_extraInitializers), __runInitializers(this, _versionId_initializers, void 0));
                __runInitializers(this, _versionId_extraInitializers);
            }
            return CreateLoaderDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _type_decorators = [(0, class_validator_1.IsEnum)(client_1.LoaderType)];
            _versionString_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _projectId_decorators = [(0, class_validator_1.IsString)()];
            _versionId_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _versionString_decorators, { kind: "field", name: "versionString", static: false, private: false, access: { has: function (obj) { return "versionString" in obj; }, get: function (obj) { return obj.versionString; }, set: function (obj, value) { obj.versionString = value; } }, metadata: _metadata }, _versionString_initializers, _versionString_extraInitializers);
            __esDecorate(null, null, _projectId_decorators, { kind: "field", name: "projectId", static: false, private: false, access: { has: function (obj) { return "projectId" in obj; }, get: function (obj) { return obj.projectId; }, set: function (obj, value) { obj.projectId = value; } }, metadata: _metadata }, _projectId_initializers, _projectId_extraInitializers);
            __esDecorate(null, null, _versionId_decorators, { kind: "field", name: "versionId", static: false, private: false, access: { has: function (obj) { return "versionId" in obj; }, get: function (obj) { return obj.versionId; }, set: function (obj, value) { obj.versionId = value; } }, metadata: _metadata }, _versionId_initializers, _versionId_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateLoaderDto = CreateLoaderDto;
