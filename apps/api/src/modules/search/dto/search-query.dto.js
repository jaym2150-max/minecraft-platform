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
exports.SearchQueryDto = void 0;
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var SearchQueryDto = function () {
    var _a;
    var _q_decorators;
    var _q_initializers = [];
    var _q_extraInitializers = [];
    var _page_decorators;
    var _page_initializers = [];
    var _page_extraInitializers = [];
    var _limit_decorators;
    var _limit_initializers = [];
    var _limit_extraInitializers = [];
    var _category_decorators;
    var _category_initializers = [];
    var _category_extraInitializers = [];
    var _loader_decorators;
    var _loader_initializers = [];
    var _loader_extraInitializers = [];
    var _sort_decorators;
    var _sort_initializers = [];
    var _sort_extraInitializers = [];
    return _a = /** @class */ (function () {
            function SearchQueryDto() {
                this.q = __runInitializers(this, _q_initializers, '');
                this.page = (__runInitializers(this, _q_extraInitializers), __runInitializers(this, _page_initializers, 1));
                this.limit = (__runInitializers(this, _page_extraInitializers), __runInitializers(this, _limit_initializers, 20));
                this.category = (__runInitializers(this, _limit_extraInitializers), __runInitializers(this, _category_initializers, void 0));
                this.loader = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _loader_initializers, void 0));
                this.sort = (__runInitializers(this, _loader_extraInitializers), __runInitializers(this, _sort_initializers, void 0));
                __runInitializers(this, _sort_extraInitializers);
            }
            return SearchQueryDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _q_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _page_decorators = [(0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(1)];
            _limit_decorators = [(0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(100)];
            _category_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _loader_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _sort_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _q_decorators, { kind: "field", name: "q", static: false, private: false, access: { has: function (obj) { return "q" in obj; }, get: function (obj) { return obj.q; }, set: function (obj, value) { obj.q = value; } }, metadata: _metadata }, _q_initializers, _q_extraInitializers);
            __esDecorate(null, null, _page_decorators, { kind: "field", name: "page", static: false, private: false, access: { has: function (obj) { return "page" in obj; }, get: function (obj) { return obj.page; }, set: function (obj, value) { obj.page = value; } }, metadata: _metadata }, _page_initializers, _page_extraInitializers);
            __esDecorate(null, null, _limit_decorators, { kind: "field", name: "limit", static: false, private: false, access: { has: function (obj) { return "limit" in obj; }, get: function (obj) { return obj.limit; }, set: function (obj, value) { obj.limit = value; } }, metadata: _metadata }, _limit_initializers, _limit_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: function (obj) { return "category" in obj; }, get: function (obj) { return obj.category; }, set: function (obj, value) { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _loader_decorators, { kind: "field", name: "loader", static: false, private: false, access: { has: function (obj) { return "loader" in obj; }, get: function (obj) { return obj.loader; }, set: function (obj, value) { obj.loader = value; } }, metadata: _metadata }, _loader_initializers, _loader_extraInitializers);
            __esDecorate(null, null, _sort_decorators, { kind: "field", name: "sort", static: false, private: false, access: { has: function (obj) { return "sort" in obj; }, get: function (obj) { return obj.sort; }, set: function (obj, value) { obj.sort = value; } }, metadata: _metadata }, _sort_initializers, _sort_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.SearchQueryDto = SearchQueryDto;
