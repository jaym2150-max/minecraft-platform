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
describe('Versions E2E', function () {
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
    describe('GET /projects/:projectId/versions', function () {
        it('should list versions for a project', function () { return __awaiter(void 0, void 0, void 0, function () {
            var projectId, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        projectId = (0, test_helpers_1.getTestIds)().projectId;
                        return [4 /*yield*/, request(app.getHttpServer())
                                .get("/api/v1/projects/".concat(projectId, "/versions"))
                                .expect(200)];
                    case 1:
                        res = _a.sent();
                        expect(Array.isArray(res.body.data)).toBe(true);
                        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return 404 for non-existent project', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .get('/api/v1/projects/non-existent-id/versions')
                            .expect(404)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /projects/:projectId/versions', function () {
        it('should create a version as the project owner', function () { return __awaiter(void 0, void 0, void 0, function () {
            var token, projectId, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = (0, test_helpers_1.getAuthToken)();
                        projectId = (0, test_helpers_1.getTestIds)().projectId;
                        return [4 /*yield*/, request(app.getHttpServer())
                                .post("/api/v1/projects/".concat(projectId, "/versions"))
                                .set('Authorization', "Bearer ".concat(token))
                                .send({
                                version: '1.1.0',
                                changelog: 'Bug fixes',
                                fileUrl: 'https://example.com/v1.1.0.jar',
                                fileSize: 2048,
                                hash: 'sha256:newhash',
                                loaders: ['FABRIC'],
                            })
                                .expect(201)];
                    case 1:
                        res = _a.sent();
                        expect(res.body.data.version).toBe('1.1.0');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject duplicate version', function () { return __awaiter(void 0, void 0, void 0, function () {
            var token, projectId, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = (0, test_helpers_1.getAuthToken)();
                        projectId = (0, test_helpers_1.getTestIds)().projectId;
                        return [4 /*yield*/, request(app.getHttpServer())
                                .post("/api/v1/projects/".concat(projectId, "/versions"))
                                .set('Authorization', "Bearer ".concat(token))
                                .send({
                                version: '1.0.0',
                                fileUrl: 'https://example.com/dup.jar',
                                fileSize: 1024,
                                hash: 'sha256:dup',
                                loaders: ['FABRIC'],
                            })];
                    case 1:
                        res = _a.sent();
                        expect([400, 409]).toContain(res.status);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject without authentication', function () { return __awaiter(void 0, void 0, void 0, function () {
            var projectId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        projectId = (0, test_helpers_1.getTestIds)().projectId;
                        return [4 /*yield*/, request(app.getHttpServer())
                                .post("/api/v1/projects/".concat(projectId, "/versions"))
                                .send({
                                version: '2.0.0',
                                fileUrl: 'https://example.com/v2.jar',
                                fileSize: 1024,
                                hash: 'sha256:v2',
                                loaders: ['FABRIC'],
                            })
                                .expect(401)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('GET /versions/:id', function () {
        it('should get a single version', function () { return __awaiter(void 0, void 0, void 0, function () {
            var versionId, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        versionId = (0, test_helpers_1.getTestIds)().versionId;
                        return [4 /*yield*/, request(app.getHttpServer())
                                .get("/api/v1/versions/".concat(versionId))
                                .expect(200)];
                    case 1:
                        res = _a.sent();
                        expect(res.body.data).toHaveProperty('version', '1.0.0');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return 404 for non-existent version', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .get('/api/v1/versions/non-existent-id')
                            .expect(404)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('GET /versions/:id/download', function () {
        it('should increment downloads and return URL', function () { return __awaiter(void 0, void 0, void 0, function () {
            var versionId, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        versionId = (0, test_helpers_1.getTestIds)().versionId;
                        return [4 /*yield*/, request(app.getHttpServer())
                                .get("/api/v1/versions/".concat(versionId, "/download"))
                                .expect(200)];
                    case 1:
                        res = _a.sent();
                        expect(res.body.data).toHaveProperty('url');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
