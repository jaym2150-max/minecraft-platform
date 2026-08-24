"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scopes = exports.SCOPES_KEY = void 0;
var common_1 = require("@nestjs/common");
exports.SCOPES_KEY = 'requiredScopes';
/**
 * Mark a route handler as requiring one of the given API key scopes (OR
 * semantics: passing any one scope in the list is sufficient). The
 * ScopesGuard reads this metadata and compares it against the scopes
 * attached to the requesting API key on `req.user.scopes`.
 *
 * Sessions authenticated via JWT always satisfy scope checks; the guard
 * treats them as having the implicit ADMIN-equivalent set.
 */
var Scopes = function () {
    var scopes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        scopes[_i] = arguments[_i];
    }
    return (0, common_1.SetMetadata)(exports.SCOPES_KEY, scopes);
};
exports.Scopes = Scopes;
