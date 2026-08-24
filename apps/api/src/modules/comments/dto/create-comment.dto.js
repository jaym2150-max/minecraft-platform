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
exports.CreateCommentDto = void 0;
var class_validator_1 = require("class-validator");
var CreateCommentDto = function () {
    var _a;
    var _content_decorators;
    var _content_initializers = [];
    var _content_extraInitializers = [];
    var _projectId_decorators;
    var _projectId_initializers = [];
    var _projectId_extraInitializers = [];
    var _parentId_decorators;
    var _parentId_initializers = [];
    var _parentId_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateCommentDto() {
                this.content = __runInitializers(this, _content_initializers, void 0);
                this.projectId = (__runInitializers(this, _content_extraInitializers), __runInitializers(this, _projectId_initializers, void 0));
                this.parentId = (__runInitializers(this, _projectId_extraInitializers), __runInitializers(this, _parentId_initializers, void 0));
                __runInitializers(this, _parentId_extraInitializers);
            }
            return CreateCommentDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _content_decorators = [(0, class_validator_1.IsString)(), (0, class_validator_1.MinLength)(1, { message: 'Comment content is required' }), (0, class_validator_1.MaxLength)(2000, { message: 'Comment must be 2000 characters or fewer' })];
            _projectId_decorators = [(0, class_validator_1.IsUUID)()];
            _parentId_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUUID)()];
            __esDecorate(null, null, _content_decorators, { kind: "field", name: "content", static: false, private: false, access: { has: function (obj) { return "content" in obj; }, get: function (obj) { return obj.content; }, set: function (obj, value) { obj.content = value; } }, metadata: _metadata }, _content_initializers, _content_extraInitializers);
            __esDecorate(null, null, _projectId_decorators, { kind: "field", name: "projectId", static: false, private: false, access: { has: function (obj) { return "projectId" in obj; }, get: function (obj) { return obj.projectId; }, set: function (obj, value) { obj.projectId = value; } }, metadata: _metadata }, _projectId_initializers, _projectId_extraInitializers);
            __esDecorate(null, null, _parentId_decorators, { kind: "field", name: "parentId", static: false, private: false, access: { has: function (obj) { return "parentId" in obj; }, get: function (obj) { return obj.parentId; }, set: function (obj, value) { obj.parentId = value; } }, metadata: _metadata }, _parentId_initializers, _parentId_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateCommentDto = CreateCommentDto;
