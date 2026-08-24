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
exports.CreateMinecraftVersionDto = void 0;
var class_validator_1 = require("class-validator");
var CreateMinecraftVersionDto = function () {
    var _a;
    var _version_decorators;
    var _version_initializers = [];
    var _version_extraInitializers = [];
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _stable_decorators;
    var _stable_initializers = [];
    var _stable_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateMinecraftVersionDto() {
                this.version = __runInitializers(this, _version_initializers, void 0);
                this.type = (__runInitializers(this, _version_extraInitializers), __runInitializers(this, _type_initializers, void 0));
                this.stable = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _stable_initializers, void 0));
                __runInitializers(this, _stable_extraInitializers);
            }
            return CreateMinecraftVersionDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _version_decorators = [(0, class_validator_1.IsString)()];
            _type_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsIn)(['release', 'snapshot', 'modded', 'beta', 'alpha'])];
            _stable_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _version_decorators, { kind: "field", name: "version", static: false, private: false, access: { has: function (obj) { return "version" in obj; }, get: function (obj) { return obj.version; }, set: function (obj, value) { obj.version = value; } }, metadata: _metadata }, _version_initializers, _version_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _stable_decorators, { kind: "field", name: "stable", static: false, private: false, access: { has: function (obj) { return "stable" in obj; }, get: function (obj) { return obj.stable; }, set: function (obj, value) { obj.stable = value; } }, metadata: _metadata }, _stable_initializers, _stable_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateMinecraftVersionDto = CreateMinecraftVersionDto;
