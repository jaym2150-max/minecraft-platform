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
describe('Auth E2E', function () {
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
    describe('POST /auth/register', function () {
        it('should register a new user', function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .post('/api/v1/auth/register')
                            .send({
                            username: 'newuser',
                            email: 'newuser@example.com',
                            password: 'NewP@ss123',
                        })
                            .expect(201)];
                    case 1:
                        res = _a.sent();
                        expect(res.body).toHaveProperty('data');
                        expect(res.body.data.user).toHaveProperty('username', 'newuser');
                        expect(res.body.data.user).toHaveProperty('email', 'newuser@example.com');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject duplicate email', function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .post('/api/v1/auth/register')
                            .send({
                            username: 'another',
                            email: 'newuser@example.com',
                            password: 'AnotherP@ss123',
                        })];
                    case 1:
                        res = _a.sent();
                        expect([400, 409]).toContain(res.status);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject weak password', function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .post('/api/v1/auth/register')
                            .send({
                            username: 'weakpw',
                            email: 'weak@example.com',
                            password: 'weak',
                        })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(400);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject invalid email', function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .post('/api/v1/auth/register')
                            .send({
                            username: 'bademail',
                            email: 'not-an-email',
                            password: 'ValidP@ss123',
                        })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(400);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject invalid username', function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .post('/api/v1/auth/register')
                            .send({
                            username: 'ab',
                            email: 'short@example.com',
                            password: 'ValidP@ss123',
                        })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(400);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /auth/login', function () {
        it('should login with valid credentials', function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .post('/api/v1/auth/login')
                            .send({ email: 'test@example.com', password: 'TestP@ss123' })
                            .expect(200)];
                    case 1:
                        res = _a.sent();
                        expect(res.body).toHaveProperty('user');
                        expect(res.body).toHaveProperty('accessToken');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject wrong password', function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .post('/api/v1/auth/login')
                            .send({ email: 'test@example.com', password: 'WrongPassword' })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(401);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject non-existent user', function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .post('/api/v1/auth/login')
                            .send({ email: 'nobody@example.com', password: 'AnyP@ss123' })];
                    case 1:
                        res = _a.sent();
                        expect(res.status).toBe(401);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('GET /auth/me', function () {
        it('should return current user with valid token', function () { return __awaiter(void 0, void 0, void 0, function () {
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
                        expect(res.body).toHaveProperty('username', 'testuser');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject request without token', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer()).get('/api/v1/auth/me').expect(401)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject invalid token', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .get('/api/v1/auth/me')
                            .set('Authorization', 'Bearer invalid-token')
                            .expect(401)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /auth/logout', function () {
        it('should logout with valid token', function () { return __awaiter(void 0, void 0, void 0, function () {
            var token, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = (0, test_helpers_1.getAuthToken)();
                        return [4 /*yield*/, request(app.getHttpServer())
                                .post('/api/v1/auth/logout')
                                .set('Authorization', "Bearer ".concat(token))
                                .expect(200)];
                    case 1:
                        res = _a.sent();
                        expect(res.body.message).toMatch(/logged out/i);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /auth/forgot-password', function () {
        it('should accept any email without leaking', function () { return __awaiter(void 0, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .post('/api/v1/auth/forgot-password')
                            .send({ email: 'test@example.com' })];
                    case 1:
                        res = _a.sent();
                        expect([200, 202]).toContain(res.status);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject missing email', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request(app.getHttpServer())
                            .post('/api/v1/auth/forgot-password')
                            .send({})
                            .expect(400)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
