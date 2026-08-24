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
exports.getTestIds = exports.getAdminToken = exports.getAuthToken2 = exports.getAuthToken = exports.getPrisma = exports.getApp = exports.TEST_ADMIN = exports.TEST_USER_2 = exports.TEST_USER = void 0;
exports.setupTestApp = setupTestApp;
exports.teardownTestApp = teardownTestApp;
exports.cleanDatabase = cleanDatabase;
exports.seedTestData = seedTestData;
var common_1 = require("@nestjs/common");
var testing_1 = require("@nestjs/testing");
var request = require("supertest");
var app_module_1 = require("../src/app.module");
var prisma_service_1 = require("../src/common/prisma/prisma.service");
var http_exception_filter_1 = require("../src/common/filters/http-exception.filter");
exports.TEST_USER = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestP@ss123',
};
exports.TEST_USER_2 = {
    username: 'testuser2',
    email: 'test2@example.com',
    password: 'TestP@ss456',
};
exports.TEST_ADMIN = {
    username: 'admin_test',
    email: 'admin@example.com',
    password: 'AdminP@ss123',
    role: 'OWNER',
};
var app;
var prisma;
var testUserId;
var testUser2Id;
var testAdminId;
var authToken;
var authToken2;
var adminToken;
var testProjectId;
var testVersionId;
var testCategoryId;
function setupTestApp() {
    return __awaiter(this, void 0, void 0, function () {
        var moduleFixture;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testing_1.Test.createTestingModule({
                        imports: [app_module_1.AppModule],
                    }).compile()];
                case 1:
                    moduleFixture = _a.sent();
                    app = moduleFixture.createNestApplication();
                    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
                    app.useGlobalPipes(new common_1.ValidationPipe({
                        whitelist: true,
                        forbidNonWhitelisted: true,
                        transform: true,
                    }));
                    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
                    prisma = app.get(prisma_service_1.PrismaService);
                    return [4 /*yield*/, prisma.$connect()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, app.init()];
                case 3:
                    _a.sent();
                    return [2 /*return*/, app];
            }
        });
    });
}
function teardownTestApp() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!prisma) return [3 /*break*/, 3];
                    return [4 /*yield*/, cleanDatabase()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, prisma.$disconnect()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    if (!app) return [3 /*break*/, 5];
                    return [4 /*yield*/, app.close()];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function cleanDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!prisma)
                        return [2 /*return*/];
                    return [4 /*yield*/, prisma.download.deleteMany({})];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, prisma.report.deleteMany({})];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, prisma.notification.deleteMany({})];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, prisma.comment.deleteMany({})];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, prisma.dependency.deleteMany({})];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, prisma.loader.deleteMany({})];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, prisma.projectVersion.deleteMany({})];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, prisma.teamMember.deleteMany({})];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, prisma.team.deleteMany({})];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, prisma.project.deleteMany({})];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, prisma.category.deleteMany({})];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, prisma.minecraftVersion.deleteMany({})];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, prisma.user.deleteMany({})];
                case 13:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function seedTestData() {
    return __awaiter(this, void 0, void 0, function () {
        var bcrypt, user1, _a, _b, user2, _c, _d, admin, _e, _f, category, mcVersion, project, version, loginRes1, loginRes2, loginRes3;
        var _g, _h, _j, _k, _l, _m;
        var _o, _p, _q, _r, _s, _t;
        return __generator(this, function (_u) {
            switch (_u.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('bcryptjs'); })];
                case 1:
                    bcrypt = _u.sent();
                    _b = (_a = prisma.user).create;
                    _g = {};
                    _h = {
                        username: exports.TEST_USER.username,
                        email: exports.TEST_USER.email
                    };
                    return [4 /*yield*/, bcrypt.hash(exports.TEST_USER.password, 10)];
                case 2: return [4 /*yield*/, _b.apply(_a, [(_g.data = (_h.passwordHash = _u.sent(),
                            _h.emailVerified = true,
                            _h),
                            _g)])];
                case 3:
                    user1 = _u.sent();
                    testUserId = user1.id;
                    _d = (_c = prisma.user).create;
                    _j = {};
                    _k = {
                        username: exports.TEST_USER_2.username,
                        email: exports.TEST_USER_2.email
                    };
                    return [4 /*yield*/, bcrypt.hash(exports.TEST_USER_2.password, 10)];
                case 4: return [4 /*yield*/, _d.apply(_c, [(_j.data = (_k.passwordHash = _u.sent(),
                            _k.emailVerified = true,
                            _k),
                            _j)])];
                case 5:
                    user2 = _u.sent();
                    testUser2Id = user2.id;
                    _f = (_e = prisma.user).create;
                    _l = {};
                    _m = {
                        username: exports.TEST_ADMIN.username,
                        email: exports.TEST_ADMIN.email
                    };
                    return [4 /*yield*/, bcrypt.hash(exports.TEST_ADMIN.password, 10)];
                case 6: return [4 /*yield*/, _f.apply(_e, [(_l.data = (_m.passwordHash = _u.sent(),
                            _m.emailVerified = true,
                            _m.role = exports.TEST_ADMIN.role,
                            _m),
                            _l)])];
                case 7:
                    admin = _u.sent();
                    testAdminId = admin.id;
                    return [4 /*yield*/, prisma.category.create({
                            data: { name: 'Test', slug: 'test', description: 'Test category' },
                        })];
                case 8:
                    category = _u.sent();
                    testCategoryId = category.id;
                    return [4 /*yield*/, prisma.minecraftVersion.create({
                            data: { version: '1.21.1', type: 'release', stable: true },
                        })];
                case 9:
                    mcVersion = _u.sent();
                    return [4 /*yield*/, prisma.project.create({
                            data: {
                                title: 'Test Project',
                                slug: 'test-project',
                                description: 'A test project',
                                body: 'Test body',
                                authorId: testUserId,
                                categoryId: testCategoryId,
                                status: 'PUBLISHED',
                            },
                        })];
                case 10:
                    project = _u.sent();
                    testProjectId = project.id;
                    return [4 /*yield*/, prisma.projectVersion.create({
                            data: {
                                projectId: testProjectId,
                                version: '1.0.0',
                                fileUrl: 'https://example.com/test.jar',
                                fileSize: 1024,
                                hash: 'sha256:test',
                                status: 'APPROVED',
                            },
                        })];
                case 11:
                    version = _u.sent();
                    testVersionId = version.id;
                    return [4 /*yield*/, request(app.getHttpServer())
                            .post('/api/v1/auth/login')
                            .send({ email: exports.TEST_USER.email, password: exports.TEST_USER.password })];
                case 12:
                    loginRes1 = _u.sent();
                    authToken = (_p = (_o = loginRes1.body.data) === null || _o === void 0 ? void 0 : _o.token) !== null && _p !== void 0 ? _p : loginRes1.body.accessToken;
                    return [4 /*yield*/, request(app.getHttpServer())
                            .post('/api/v1/auth/login')
                            .send({ email: exports.TEST_USER_2.email, password: exports.TEST_USER_2.password })];
                case 13:
                    loginRes2 = _u.sent();
                    authToken2 = (_r = (_q = loginRes2.body.data) === null || _q === void 0 ? void 0 : _q.token) !== null && _r !== void 0 ? _r : loginRes2.body.accessToken;
                    return [4 /*yield*/, request(app.getHttpServer())
                            .post('/api/v1/auth/login')
                            .send({ email: exports.TEST_ADMIN.email, password: exports.TEST_ADMIN.password })];
                case 14:
                    loginRes3 = _u.sent();
                    adminToken = (_t = (_s = loginRes3.body.data) === null || _s === void 0 ? void 0 : _s.token) !== null && _t !== void 0 ? _t : loginRes3.body.accessToken;
                    return [2 /*return*/];
            }
        });
    });
}
var getApp = function () { return app; };
exports.getApp = getApp;
var getPrisma = function () { return prisma; };
exports.getPrisma = getPrisma;
var getAuthToken = function () { return authToken; };
exports.getAuthToken = getAuthToken;
var getAuthToken2 = function () { return authToken2; };
exports.getAuthToken2 = getAuthToken2;
var getAdminToken = function () { return adminToken; };
exports.getAdminToken = getAdminToken;
var getTestIds = function () { return ({
    userId: testUserId,
    user2Id: testUser2Id,
    adminId: testAdminId,
    projectId: testProjectId,
    versionId: testVersionId,
    categoryId: testCategoryId,
}); };
exports.getTestIds = getTestIds;
