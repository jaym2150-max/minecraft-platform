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
exports.CreateLicenseDto = void 0;
var class_validator_1 = require("class-validator");
var client_1 = require("@prisma/client");
var CreateLicenseDto = function () {
    var _a;
    var _shortId_decorators;
    var _shortId_initializers = [];
    var _shortId_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _url_decorators;
    var _url_initializers = [];
    var _url_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _body_decorators;
    var _body_initializers = [];
    var _body_extraInitializers = [];
    var _featured_decorators;
    var _featured_initializers = [];
    var _featured_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateLicenseDto() {
                this.shortId = __runInitializers(this, _shortId_initializers, void 0);
                this.name = (__runInitializers(this, _shortId_extraInitializers), __runInitializers(this, _name_initializers, void 0));
                this.type = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _type_initializers, void 0));
                this.url = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _url_initializers, void 0));
                this.description = (__runInitializers(this, _url_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.body = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _body_initializers, void 0));
                this.featured = (__runInitializers(this, _body_extraInitializers), __runInitializers(this, _featured_initializers, void 0));
                __runInitializers(this, _featured_extraInitializers);
            }
            return CreateLicenseDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _shortId_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(64)];
            _name_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(200)];
            _type_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(client_1.LicenseType)];
            _url_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUrl)()];
            _description_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _body_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _featured_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _shortId_decorators, { kind: "field", name: "shortId", static: false, private: false, access: { has: function (obj) { return "shortId" in obj; }, get: function (obj) { return obj.shortId; }, set: function (obj, value) { obj.shortId = value; } }, metadata: _metadata }, _shortId_initializers, _shortId_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _url_decorators, { kind: "field", name: "url", static: false, private: false, access: { has: function (obj) { return "url" in obj; }, get: function (obj) { return obj.url; }, set: function (obj, value) { obj.url = value; } }, metadata: _metadata }, _url_initializers, _url_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _body_decorators, { kind: "field", name: "body", static: false, private: false, access: { has: function (obj) { return "body" in obj; }, get: function (obj) { return obj.body; }, set: function (obj, value) { obj.body = value; } }, metadata: _metadata }, _body_initializers, _body_extraInitializers);
            __esDecorate(null, null, _featured_decorators, { kind: "field", name: "featured", static: false, private: false, access: { has: function (obj) { return "featured" in obj; }, get: function (obj) { return obj.featured; }, set: function (obj, value) { obj.featured = value; } }, metadata: _metadata }, _featured_initializers, _featured_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateLicenseDto = CreateLicenseDto;
