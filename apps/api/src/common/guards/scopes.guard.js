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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopesGuard = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var scopes_decorator_1 = require("../decorators/scopes.decorator");
var ScopesGuard = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ScopesGuard = _classThis = /** @class */ (function () {
        function ScopesGuard_1(reflector) {
            this.reflector = reflector;
        }
        ScopesGuard_1.prototype.canActivate = function (context) {
            var required = this.reflector.getAllAndOverride(scopes_decorator_1.SCOPES_KEY, [context.getHandler(), context.getClass()]);
            if (!required || required.length === 0)
                return true;
            var request = context.switchToHttp().getRequest();
            var user = request.user;
            if (!user) {
                throw new common_1.ForbiddenException('Authentication required');
            }
            // JWT-authenticated sessions have full access. The auth controller is
            // the only place a session is issued, and the user role is loaded into
            // req.user by JwtStrategy; admins/moderators/owners are unrestricted.
            if (user.authType === 'jwt' || user.role === client_1.UserRole.ADMIN || user.role === client_1.UserRole.OWNER) {
                return true;
            }
            var scopes = Array.isArray(user.scopes)
                ? user.scopes
                : typeof user.scopes === 'string'
                    ? user.scopes.split(',').map(function (s) { return s.trim(); }).filter(Boolean)
                    : [];
            // ADMIN scope satisfies any requirement.
            if (scopes.includes(client_1.ApiKeyScope.ADMIN))
                return true;
            var hasMatch = required.some(function (s) { return scopes.includes(s); });
            if (!hasMatch) {
                throw new common_1.ForbiddenException("Missing required API key scope(s): ".concat(required.join(', ')));
            }
            return true;
        };
        return ScopesGuard_1;
    }());
    __setFunctionName(_classThis, "ScopesGuard");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ScopesGuard = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ScopesGuard = _classThis;
}();
exports.ScopesGuard = ScopesGuard;
