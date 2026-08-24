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
exports.CreateCategoryDto = void 0;
var class_validator_1 = require("class-validator");
var CreateCategoryDto = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _slug_decorators;
    var _slug_initializers = [];
    var _slug_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _icon_decorators;
    var _icon_initializers = [];
    var _icon_extraInitializers = [];
    var _color_decorators;
    var _color_initializers = [];
    var _color_extraInitializers = [];
    var _order_decorators;
    var _order_initializers = [];
    var _order_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateCategoryDto() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.slug = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _slug_initializers, void 0));
                this.description = (__runInitializers(this, _slug_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.icon = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _icon_initializers, void 0));
                this.color = (__runInitializers(this, _icon_extraInitializers), __runInitializers(this, _color_initializers, void 0));
                this.order = (__runInitializers(this, _color_extraInitializers), __runInitializers(this, _order_initializers, void 0));
                __runInitializers(this, _order_extraInitializers);
            }
            return CreateCategoryDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, class_validator_1.IsString)()];
            _slug_decorators = [(0, class_validator_1.IsString)()];
            _description_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _icon_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _color_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _order_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(0)];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _slug_decorators, { kind: "field", name: "slug", static: false, private: false, access: { has: function (obj) { return "slug" in obj; }, get: function (obj) { return obj.slug; }, set: function (obj, value) { obj.slug = value; } }, metadata: _metadata }, _slug_initializers, _slug_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _icon_decorators, { kind: "field", name: "icon", static: false, private: false, access: { has: function (obj) { return "icon" in obj; }, get: function (obj) { return obj.icon; }, set: function (obj, value) { obj.icon = value; } }, metadata: _metadata }, _icon_initializers, _icon_extraInitializers);
            __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: function (obj) { return "color" in obj; }, get: function (obj) { return obj.color; }, set: function (obj, value) { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
            __esDecorate(null, null, _order_decorators, { kind: "field", name: "order", static: false, private: false, access: { has: function (obj) { return "order" in obj; }, get: function (obj) { return obj.order; }, set: function (obj, value) { obj.order = value; } }, metadata: _metadata }, _order_initializers, _order_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateCategoryDto = CreateCategoryDto;
