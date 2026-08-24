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
exports.CreateApiKeyDto = void 0;
var class_validator_1 = require("class-validator");
var client_1 = require("@prisma/client");
var CreateApiKeyDto = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _scopes_decorators;
    var _scopes_initializers = [];
    var _scopes_extraInitializers = [];
    var _ipAllowlist_decorators;
    var _ipAllowlist_initializers = [];
    var _ipAllowlist_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateApiKeyDto() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.scopes = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _scopes_initializers, void 0));
                this.ipAllowlist = (__runInitializers(this, _scopes_extraInitializers), __runInitializers(this, _ipAllowlist_initializers, void 0));
                __runInitializers(this, _ipAllowlist_extraInitializers);
            }
            return CreateApiKeyDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.MinLength)(1), (0, class_validator_1.MaxLength)(100)];
            _scopes_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.ArrayUnique)(), (0, class_validator_1.IsEnum)(client_1.ApiKeyScope, { each: true })];
            _ipAllowlist_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _scopes_decorators, { kind: "field", name: "scopes", static: false, private: false, access: { has: function (obj) { return "scopes" in obj; }, get: function (obj) { return obj.scopes; }, set: function (obj, value) { obj.scopes = value; } }, metadata: _metadata }, _scopes_initializers, _scopes_extraInitializers);
            __esDecorate(null, null, _ipAllowlist_decorators, { kind: "field", name: "ipAllowlist", static: false, private: false, access: { has: function (obj) { return "ipAllowlist" in obj; }, get: function (obj) { return obj.ipAllowlist; }, set: function (obj, value) { obj.ipAllowlist = value; } }, metadata: _metadata }, _ipAllowlist_initializers, _ipAllowlist_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateApiKeyDto = CreateApiKeyDto;
