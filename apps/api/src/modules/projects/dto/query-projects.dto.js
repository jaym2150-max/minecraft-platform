"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.QueryProjectsDto = void 0;
var class_validator_1 = require("class-validator");
var pagination_dto_1 = require("../../../common/dto/pagination.dto");
var client_1 = require("@prisma/client");
var QueryProjectsDto = function () {
    var _a;
    var _classSuper = pagination_dto_1.PaginationDto;
    var _search_decorators;
    var _search_initializers = [];
    var _search_extraInitializers = [];
    var _category_decorators;
    var _category_initializers = [];
    var _category_extraInitializers = [];
    var _loader_decorators;
    var _loader_initializers = [];
    var _loader_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _author_decorators;
    var _author_initializers = [];
    var _author_extraInitializers = [];
    var _projectType_decorators;
    var _projectType_initializers = [];
    var _projectType_extraInitializers = [];
    var _licenseId_decorators;
    var _licenseId_initializers = [];
    var _licenseId_extraInitializers = [];
    var _ids_decorators;
    var _ids_initializers = [];
    var _ids_extraInitializers = [];
    return _a = /** @class */ (function (_super) {
            __extends(QueryProjectsDto, _super);
            function QueryProjectsDto() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.search = __runInitializers(_this, _search_initializers, void 0);
                _this.category = (__runInitializers(_this, _search_extraInitializers), __runInitializers(_this, _category_initializers, void 0));
                _this.loader = (__runInitializers(_this, _category_extraInitializers), __runInitializers(_this, _loader_initializers, void 0));
                _this.status = (__runInitializers(_this, _loader_extraInitializers), __runInitializers(_this, _status_initializers, void 0));
                _this.author = (__runInitializers(_this, _status_extraInitializers), __runInitializers(_this, _author_initializers, void 0));
                _this.projectType = (__runInitializers(_this, _author_extraInitializers), __runInitializers(_this, _projectType_initializers, void 0));
                _this.licenseId = (__runInitializers(_this, _projectType_extraInitializers), __runInitializers(_this, _licenseId_initializers, void 0));
                _this.ids = (__runInitializers(_this, _licenseId_extraInitializers), __runInitializers(_this, _ids_initializers, void 0));
                __runInitializers(_this, _ids_extraInitializers);
                return _this;
            }
            return QueryProjectsDto;
        }(_classSuper)),
        (function () {
            var _b;
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _search_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _category_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _loader_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _status_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsEnum)(client_1.ProjectStatus)];
            _author_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _projectType_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _licenseId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUUID)()];
            _ids_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _search_decorators, { kind: "field", name: "search", static: false, private: false, access: { has: function (obj) { return "search" in obj; }, get: function (obj) { return obj.search; }, set: function (obj, value) { obj.search = value; } }, metadata: _metadata }, _search_initializers, _search_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: function (obj) { return "category" in obj; }, get: function (obj) { return obj.category; }, set: function (obj, value) { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _loader_decorators, { kind: "field", name: "loader", static: false, private: false, access: { has: function (obj) { return "loader" in obj; }, get: function (obj) { return obj.loader; }, set: function (obj, value) { obj.loader = value; } }, metadata: _metadata }, _loader_initializers, _loader_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _author_decorators, { kind: "field", name: "author", static: false, private: false, access: { has: function (obj) { return "author" in obj; }, get: function (obj) { return obj.author; }, set: function (obj, value) { obj.author = value; } }, metadata: _metadata }, _author_initializers, _author_extraInitializers);
            __esDecorate(null, null, _projectType_decorators, { kind: "field", name: "projectType", static: false, private: false, access: { has: function (obj) { return "projectType" in obj; }, get: function (obj) { return obj.projectType; }, set: function (obj, value) { obj.projectType = value; } }, metadata: _metadata }, _projectType_initializers, _projectType_extraInitializers);
            __esDecorate(null, null, _licenseId_decorators, { kind: "field", name: "licenseId", static: false, private: false, access: { has: function (obj) { return "licenseId" in obj; }, get: function (obj) { return obj.licenseId; }, set: function (obj, value) { obj.licenseId = value; } }, metadata: _metadata }, _licenseId_initializers, _licenseId_extraInitializers);
            __esDecorate(null, null, _ids_decorators, { kind: "field", name: "ids", static: false, private: false, access: { has: function (obj) { return "ids" in obj; }, get: function (obj) { return obj.ids; }, set: function (obj, value) { obj.ids = value; } }, metadata: _metadata }, _ids_initializers, _ids_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.QueryProjectsDto = QueryProjectsDto;
