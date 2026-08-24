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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursorPaginationDto = void 0;
exports.encodeCursor = encodeCursor;
exports.decodeCursor = decodeCursor;
exports.paginateCursor = paginateCursor;
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var CursorPaginationDto = function () {
    var _a;
    var _cursor_decorators;
    var _cursor_initializers = [];
    var _cursor_extraInitializers = [];
    var _limit_decorators;
    var _limit_initializers = [];
    var _limit_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CursorPaginationDto() {
                this.cursor = __runInitializers(this, _cursor_initializers, void 0);
                this.limit = (__runInitializers(this, _cursor_extraInitializers), __runInitializers(this, _limit_initializers, 20));
                __runInitializers(this, _limit_extraInitializers);
            }
            return CursorPaginationDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _cursor_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _limit_decorators = [(0, class_validator_1.IsOptional)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(100)];
            __esDecorate(null, null, _cursor_decorators, { kind: "field", name: "cursor", static: false, private: false, access: { has: function (obj) { return "cursor" in obj; }, get: function (obj) { return obj.cursor; }, set: function (obj, value) { obj.cursor = value; } }, metadata: _metadata }, _cursor_initializers, _cursor_extraInitializers);
            __esDecorate(null, null, _limit_decorators, { kind: "field", name: "limit", static: false, private: false, access: { has: function (obj) { return "limit" in obj; }, get: function (obj) { return obj.limit; }, set: function (obj, value) { obj.limit = value; } }, metadata: _metadata }, _limit_initializers, _limit_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CursorPaginationDto = CursorPaginationDto;
function encodeCursor(value) {
    if (!value)
        return null;
    return Buffer.from(value, 'utf8').toString('base64url');
}
function decodeCursor(cursor) {
    if (!cursor)
        return null;
    try {
        return Buffer.from(cursor, 'base64url').toString('utf8');
    }
    catch (_a) {
        return null;
    }
}
/**
 * Cursor-based paginator. `take` is the page size; we always over-fetch by 1
 * so we know whether another page exists without an extra count query.
 * The opaque cursor encodes the last-seen row's primary key; pass it back as
 * `cursor` to get the next page.
 *
 * The `prismaDelegate.findMany` callback receives the raw args from this
 * helper (where / orderBy / take / cursor / skip). The caller is expected to
 * forward them to the actual Prisma delegate and add any includes/selects.
 * Because the args are typed `unknown` at this layer, callers must cast
 * internally — see projects.service.ts findAllCursor for the pattern.
 */
function paginateCursor(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var take, decoded, rows, hasMore, data, last, nextCursor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    take = Math.max(1, Math.min(100, opts.take));
                    decoded = decodeCursor(opts.cursor);
                    return [4 /*yield*/, opts.prismaDelegate.findMany({
                            where: opts.where,
                            orderBy: opts.orderBy,
                            take: take + 1,
                            cursor: decoded ? { id: decoded } : undefined,
                            skip: decoded ? 1 : undefined,
                        })];
                case 1:
                    rows = (_a.sent());
                    hasMore = rows.length > take;
                    data = hasMore ? rows.slice(0, take) : rows;
                    last = data[data.length - 1];
                    nextCursor = hasMore && last ? encodeCursor(last.id) : null;
                    return [2 /*return*/, { data: data, nextCursor: nextCursor, hasMore: hasMore }];
            }
        });
    });
}
