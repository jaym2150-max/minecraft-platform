"use strict";
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
var request = require("supertest");
var prisma_service_1 = require("../src/common/prisma/prisma.service");
var test_helpers_1 = require("./test-helpers");
describe('Licenses E2E', function () {
    var app;
    var prisma;
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, test_helpers_1.setupTestApp)()];
                case 1:
                    app = _a.sent();
                    return [4 /*yield*/, (0, test_helpers_1.cleanDatabase)()];
                case 2:
                    _a.sent();
                    prisma = app.get(prisma_service_1.PrismaService);
                    // The migration seeds standard licenses, but tests start from an empty DB
                    // (cleanDatabase wipes everything). Re-seed the canonical set so this spec
                    // is self-sufficient.
                    return [4 /*yield*/, prisma.license.create({
                            data: {
                                shortId: 'MIT',
                                name: 'MIT License',
                                type: 'PERMISSIVE',
                                url: 'https://opensource.org/licenses/MIT',
                                description: 'Permissive license',
                                featured: true,
                            },
                        })];
                case 3:
                    // The migration seeds standard licenses, but tests start from an empty DB
                    // (cleanDatabase wipes everything). Re-seed the canonical set so this spec
                    // is self-sufficient.
                    _a.sent();
                    return [4 /*yield*/, prisma.license.create({
                            data: {
                                shortId: 'Apache-2.0',
                                name: 'Apache License 2.0',
                                type: 'PERMISSIVE',
                                url: 'https://www.apache.org/licenses/LICENSE-2.0',
                                description: 'Permissive license with patent grant',
                                featured: true,
                            },
                        })];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, test_helpers_1.teardownTestApp)()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('GET /licenses', function () {
        it('should list all licenses', function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .get('/api/v1/licenses')
                            .expect(200)];
                    case 1:
                        res = _a.sent();
                        expect(Array.isArray(res.body.data)).toBe(true);
                        expect(res.body.data.length).toBeGreaterThanOrEqual(2);
                        expect(res.body.data.find(function (l) { return l.shortId === 'MIT'; })).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('GET /licenses/:shortId', function () {
        it('should return a license by shortId', function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .get('/api/v1/licenses/MIT')
                            .expect(200)];
                    case 1:
                        res = _a.sent();
                        expect(res.body.data).toHaveProperty('shortId', 'MIT');
                        expect(res.body.data).toHaveProperty('type', 'PERMISSIVE');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return 404 for unknown license', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .get('/api/v1/licenses/does-not-exist')
                            .expect(404)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('GET /licenses/:shortId/text', function () {
        it.skip('should return the license body text (requires controller)', function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .get('/api/v1/licenses/MIT/text')
                            .expect(200)];
                    case 1:
                        res = _a.sent();
                        expect(res.body.data).toHaveProperty('shortId', 'MIT');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /admin/licenses', function () {
        it.skip('should create a license when admin (requires controller + admin auth)', function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .post('/api/v1/admin/licenses')
                            .send({
                            shortId: 'TEST',
                            name: 'Test License',
                            type: 'PERMISSIVE',
                        })
                            .expect(201)];
                    case 1:
                        res = _a.sent();
                        expect(res.body.data.shortId).toBe('TEST');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
