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
var test_helpers_1 = require("./test-helpers");
describe('Search E2E', function () {
    var app;
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, test_helpers_1.setupTestApp)()];
                case 1:
                    app = _a.sent();
                    return [4 /*yield*/, (0, test_helpers_1.cleanDatabase)()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, test_helpers_1.seedTestData)()];
                case 3:
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
    describe('GET /search', function () {
        it('should return search results', function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .get('/api/v1/search?q=Test')
                            .expect(200)];
                    case 1:
                        res = _a.sent();
                        expect(res.body).toHaveProperty('data');
                        expect(res.body).toHaveProperty('meta');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return empty results for nonsense query', function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .get('/api/v1/search?q=zzzzzzzzzqqqqqqqxxxxxx')
                            .expect(200)];
                    case 1:
                        res = _a.sent();
                        expect(Array.isArray(res.body.data)).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should support pagination params', function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .get('/api/v1/search?q=&page=1&limit=5')
                            .expect(200)];
                    case 1:
                        res = _a.sent();
                        expect(res.body.meta.limit).toBe(5);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
describe('Teams E2E', function () {
    var app;
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, test_helpers_1.setupTestApp)()];
                case 1:
                    app = _a.sent();
                    return [4 /*yield*/, (0, test_helpers_1.cleanDatabase)()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, test_helpers_1.seedTestData)()];
                case 3:
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
    describe('GET /projects/:projectId/team', function () {
        it('should return team for project', function () { return __awaiter(void 0, void 0, void 0, function () {
            var projectId, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        projectId = (0, test_helpers_1.getTestIds)().projectId;
                        return [4 /*yield*/, request(app.getHttpServer())
                                .get("/api/v1/projects/".concat(projectId, "/team"))
                                .expect(200)];
                    case 1:
                        res = _a.sent();
                        expect(res.body).toHaveProperty('data');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
describe('Dependencies E2E', function () {
    var app;
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, test_helpers_1.setupTestApp)()];
                case 1:
                    app = _a.sent();
                    return [4 /*yield*/, (0, test_helpers_1.cleanDatabase)()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, test_helpers_1.seedTestData)()];
                case 3:
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
    describe('GET /projects/:projectId/dependencies', function () {
        it('should return dependencies', function () { return __awaiter(void 0, void 0, void 0, function () {
            var projectId, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        projectId = (0, test_helpers_1.getTestIds)().projectId;
                        return [4 /*yield*/, request(app.getHttpServer())
                                .get("/api/v1/projects/".concat(projectId, "/dependencies"))
                                .expect(200)];
                    case 1:
                        res = _a.sent();
                        expect(Array.isArray(res.body.data)).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /projects/:projectId/dependencies', function () {
        it('should require authentication', function () { return __awaiter(void 0, void 0, void 0, function () {
            var projectId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        projectId = (0, test_helpers_1.getTestIds)().projectId;
                        return [4 /*yield*/, request(app.getHttpServer())
                                .post("/api/v1/projects/".concat(projectId, "/dependencies"))
                                .send({ requiredId: 'some-id' })
                                .expect(401)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject self-dependency', function () { return __awaiter(void 0, void 0, void 0, function () {
            var token, projectId, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = (0, test_helpers_1.getAuthToken)();
                        projectId = (0, test_helpers_1.getTestIds)().projectId;
                        return [4 /*yield*/, request(app.getHttpServer())
                                .post("/api/v1/projects/".concat(projectId, "/dependencies"))
                                .set('Authorization', "Bearer ".concat(token))
                                .send({ requiredId: projectId })];
                    case 1:
                        res = _a.sent();
                        expect([400, 409]).toContain(res.status);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
