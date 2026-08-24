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
var node_crypto_1 = require("node:crypto");
function makeKey(name) {
    return "mcp_pat_".concat((0, node_crypto_1.createHash)('sha256').update(name).digest('hex').slice(0, 32));
}
describe('API key scopes E2E', function () {
    var app;
    var prisma;
    var userId;
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        var user;
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
                    prisma = app.get(prisma_service_1.PrismaService);
                    return [4 /*yield*/, prisma.user.findUnique({ where: { email: 'test@example.com' } })];
                case 4:
                    user = _a.sent();
                    if (!user)
                        throw new Error('test user missing');
                    userId = user.id;
                    return [4 /*yield*/, prisma.apiKey.create({
                            data: {
                                name: 'readonly',
                                keyHash: (0, node_crypto_1.createHash)('sha256').update(makeKey('readonly')).digest('hex'),
                                lastChars: 'ro',
                                scopes: ['READ'],
                                userId: userId,
                            },
                        })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, prisma.apiKey.create({
                            data: {
                                name: 'projectwrite',
                                keyHash: (0, node_crypto_1.createHash)('sha256').update(makeKey('projectwrite')).digest('hex'),
                                lastChars: 'pw',
                                scopes: ['READ', 'PROJECT_WRITE'],
                                userId: userId,
                            },
                        })];
                case 6:
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
    describe('PROJECT_WRITE scope required', function () {
        it.skip('should reject an API key without PROJECT_WRITE when creating a project', function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .post('/api/v1/projects')
                            .set('Authorization', "Bearer ".concat(makeKey('readonly')))
                            .send({ title: 'No scope', description: 'Should fail', body: 'b' })];
                    case 1:
                        res = _a.sent();
                        expect([401, 403]).toContain(res.status);
                        return [2 /*return*/];
                }
            });
        }); });
        it.skip('should accept an API key with PROJECT_WRITE', function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .post('/api/v1/projects')
                            .set('Authorization', "Bearer ".concat(makeKey('projectwrite')))
                            .send({ title: 'Scoped Mod', description: 'Works', body: 'b' })];
                    case 1:
                        res = _a.sent();
                        expect([200, 201]).toContain(res.status);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('User session token baseline', function () {
        it('a logged-in user can read their own profile', function () { return __awaiter(void 0, void 0, void 0, function () {
            var token, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = (0, test_helpers_1.getAuthToken)();
                        return [4 /*yield*/, request(app.getHttpServer())
                                .get('/api/v1/auth/me')
                                .set('Authorization', "Bearer ".concat(token))
                                .expect(200)];
                    case 1:
                        res = _a.sent();
                        expect(res.body.data).toHaveProperty('email', 'test@example.com');
                        return [2 /*return*/];
                }
            });
        }); });
        it('admin token still works', function () { return __awaiter(void 0, void 0, void 0, function () {
            var token, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = (0, test_helpers_1.getAdminToken)();
                        return [4 /*yield*/, request(app.getHttpServer())
                                .get('/api/v1/auth/me')
                                .set('Authorization', "Bearer ".concat(token))
                                .expect(200)];
                    case 1:
                        res = _a.sent();
                        expect(['admin_test', 'admin@minecraftplatform.com']).toContain(res.body.data.username);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
