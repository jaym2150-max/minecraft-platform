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
exports.ReorderGalleryDto = exports.UpdateGalleryItemDto = exports.CreateGalleryItemDto = void 0;
var class_validator_1 = require("class-validator");
var client_1 = require("@prisma/client");
var CreateGalleryItemDto = function () {
    var _a;
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _alt_decorators;
    var _alt_initializers = [];
    var _alt_extraInitializers = [];
    var _order_decorators;
    var _order_initializers = [];
    var _order_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateGalleryItemDto() {
                this.type = __runInitializers(this, _type_initializers, void 0);
                this.alt = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _alt_initializers, void 0));
                this.order = (__runInitializers(this, _alt_extraInitializers), __runInitializers(this, _order_initializers, void 0));
                __runInitializers(this, _order_extraInitializers);
            }
            return CreateGalleryItemDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _type_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(client_1.GalleryItemType)];
            _alt_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _order_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(0)];
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(null, null, _alt_decorators, { kind: "field", name: "alt", static: false, private: false, access: { has: function (obj) { return "alt" in obj; }, get: function (obj) { return obj.alt; }, set: function (obj, value) { obj.alt = value; } }, metadata: _metadata }, _alt_initializers, _alt_extraInitializers);
            __esDecorate(null, null, _order_decorators, { kind: "field", name: "order", static: false, private: false, access: { has: function (obj) { return "order" in obj; }, get: function (obj) { return obj.order; }, set: function (obj, value) { obj.order = value; } }, metadata: _metadata }, _order_initializers, _order_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateGalleryItemDto = CreateGalleryItemDto;
var UpdateGalleryItemDto = function () {
    var _a;
    var _alt_decorators;
    var _alt_initializers = [];
    var _alt_extraInitializers = [];
    var _order_decorators;
    var _order_initializers = [];
    var _order_extraInitializers = [];
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateGalleryItemDto() {
                this.alt = __runInitializers(this, _alt_initializers, void 0);
                this.order = (__runInitializers(this, _alt_extraInitializers), __runInitializers(this, _order_initializers, void 0));
                this.type = (__runInitializers(this, _order_extraInitializers), __runInitializers(this, _type_initializers, void 0));
                __runInitializers(this, _type_extraInitializers);
            }
            return UpdateGalleryItemDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _alt_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _order_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(0)];
            _type_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(client_1.GalleryItemType)];
            __esDecorate(null, null, _alt_decorators, { kind: "field", name: "alt", static: false, private: false, access: { has: function (obj) { return "alt" in obj; }, get: function (obj) { return obj.alt; }, set: function (obj, value) { obj.alt = value; } }, metadata: _metadata }, _alt_initializers, _alt_extraInitializers);
            __esDecorate(null, null, _order_decorators, { kind: "field", name: "order", static: false, private: false, access: { has: function (obj) { return "order" in obj; }, get: function (obj) { return obj.order; }, set: function (obj, value) { obj.order = value; } }, metadata: _metadata }, _order_initializers, _order_extraInitializers);
            __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateGalleryItemDto = UpdateGalleryItemDto;
var ReorderGalleryDto = function () {
    var _a;
    var _ids_decorators;
    var _ids_initializers = [];
    var _ids_extraInitializers = [];
    return _a = /** @class */ (function () {
            function ReorderGalleryDto() {
                this.ids = __runInitializers(this, _ids_initializers, void 0);
                __runInitializers(this, _ids_extraInitializers);
            }
            return ReorderGalleryDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _ids_decorators = [(0, class_validator_1.IsString)({ each: true })];
            __esDecorate(null, null, _ids_decorators, { kind: "field", name: "ids", static: false, private: false, access: { has: function (obj) { return "ids" in obj; }, get: function (obj) { return obj.ids; }, set: function (obj, value) { obj.ids = value; } }, metadata: _metadata }, _ids_initializers, _ids_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.ReorderGalleryDto = ReorderGalleryDto;
