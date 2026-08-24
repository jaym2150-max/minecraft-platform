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
exports.UpdateDependencyDto = exports.CreateDependencyDto = void 0;
var class_validator_1 = require("class-validator");
var CreateDependencyDto = function () {
    var _a;
    var _requiredId_decorators;
    var _requiredId_initializers = [];
    var _requiredId_extraInitializers = [];
    var _versionId_decorators;
    var _versionId_initializers = [];
    var _versionId_extraInitializers = [];
    var _isRequired_decorators;
    var _isRequired_initializers = [];
    var _isRequired_extraInitializers = [];
    var _isOptional_decorators;
    var _isOptional_initializers = [];
    var _isOptional_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateDependencyDto() {
                this.requiredId = __runInitializers(this, _requiredId_initializers, void 0);
                this.versionId = (__runInitializers(this, _requiredId_extraInitializers), __runInitializers(this, _versionId_initializers, void 0));
                this.isRequired = (__runInitializers(this, _versionId_extraInitializers), __runInitializers(this, _isRequired_initializers, void 0));
                this.isOptional = (__runInitializers(this, _isRequired_extraInitializers), __runInitializers(this, _isOptional_initializers, void 0));
                __runInitializers(this, _isOptional_extraInitializers);
            }
            return CreateDependencyDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _requiredId_decorators = [(0, class_validator_1.IsUUID)()];
            _versionId_decorators = [(0, class_validator_1.IsUUID)()];
            _isRequired_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _isOptional_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _requiredId_decorators, { kind: "field", name: "requiredId", static: false, private: false, access: { has: function (obj) { return "requiredId" in obj; }, get: function (obj) { return obj.requiredId; }, set: function (obj, value) { obj.requiredId = value; } }, metadata: _metadata }, _requiredId_initializers, _requiredId_extraInitializers);
            __esDecorate(null, null, _versionId_decorators, { kind: "field", name: "versionId", static: false, private: false, access: { has: function (obj) { return "versionId" in obj; }, get: function (obj) { return obj.versionId; }, set: function (obj, value) { obj.versionId = value; } }, metadata: _metadata }, _versionId_initializers, _versionId_extraInitializers);
            __esDecorate(null, null, _isRequired_decorators, { kind: "field", name: "isRequired", static: false, private: false, access: { has: function (obj) { return "isRequired" in obj; }, get: function (obj) { return obj.isRequired; }, set: function (obj, value) { obj.isRequired = value; } }, metadata: _metadata }, _isRequired_initializers, _isRequired_extraInitializers);
            __esDecorate(null, null, _isOptional_decorators, { kind: "field", name: "isOptional", static: false, private: false, access: { has: function (obj) { return "isOptional" in obj; }, get: function (obj) { return obj.isOptional; }, set: function (obj, value) { obj.isOptional = value; } }, metadata: _metadata }, _isOptional_initializers, _isOptional_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateDependencyDto = CreateDependencyDto;
var UpdateDependencyDto = function () {
    var _a;
    var _isRequired_decorators;
    var _isRequired_initializers = [];
    var _isRequired_extraInitializers = [];
    var _isOptional_decorators;
    var _isOptional_initializers = [];
    var _isOptional_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateDependencyDto() {
                this.isRequired = __runInitializers(this, _isRequired_initializers, void 0);
                this.isOptional = (__runInitializers(this, _isRequired_extraInitializers), __runInitializers(this, _isOptional_initializers, void 0));
                __runInitializers(this, _isOptional_extraInitializers);
            }
            return UpdateDependencyDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _isRequired_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            _isOptional_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _isRequired_decorators, { kind: "field", name: "isRequired", static: false, private: false, access: { has: function (obj) { return "isRequired" in obj; }, get: function (obj) { return obj.isRequired; }, set: function (obj, value) { obj.isRequired = value; } }, metadata: _metadata }, _isRequired_initializers, _isRequired_extraInitializers);
            __esDecorate(null, null, _isOptional_decorators, { kind: "field", name: "isOptional", static: false, private: false, access: { has: function (obj) { return "isOptional" in obj; }, get: function (obj) { return obj.isOptional; }, set: function (obj, value) { obj.isOptional = value; } }, metadata: _metadata }, _isOptional_initializers, _isOptional_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateDependencyDto = UpdateDependencyDto;
