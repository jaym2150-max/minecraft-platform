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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamsService = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var TeamsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var TeamsService = _classThis = /** @class */ (function () {
        function TeamsService_1(prisma) {
            this.prisma = prisma;
            this.logger = new common_1.Logger(TeamsService.name);
        }
        TeamsService_1.prototype.findByProject = function (projectId) {
            return __awaiter(this, void 0, void 0, function () {
                var project, team;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({ where: { id: projectId } })];
                        case 1:
                            project = _a.sent();
                            if (!project) {
                                throw new common_1.NotFoundException("Project with id \"".concat(projectId, "\" not found"));
                            }
                            return [4 /*yield*/, this.prisma.team.findFirst({
                                    where: { projectId: projectId },
                                    include: {
                                        members: {
                                            include: {
                                                user: { select: { id: true, username: true, avatarUrl: true } },
                                            },
                                        },
                                    },
                                })];
                        case 2:
                            team = _a.sent();
                            if (!team) {
                                return [2 /*return*/, null];
                            }
                            return [2 /*return*/, {
                                    id: team.id,
                                    name: team.name,
                                    description: team.description,
                                    projectId: team.projectId,
                                    createdAt: team.createdAt.toISOString(),
                                    updatedAt: team.updatedAt.toISOString(),
                                    members: team.members.map(function (m) { return ({
                                        id: m.id,
                                        userId: m.userId,
                                        role: m.role,
                                        user: m.user,
                                    }); }),
                                }];
                    }
                });
            });
        };
        TeamsService_1.prototype.create = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                var project, existing, team;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({ where: { id: dto.projectId } })];
                        case 1:
                            project = _a.sent();
                            if (!project) {
                                throw new common_1.NotFoundException("Project with id \"".concat(dto.projectId, "\" not found"));
                            }
                            return [4 /*yield*/, this.prisma.team.findFirst({ where: { projectId: dto.projectId } })];
                        case 2:
                            existing = _a.sent();
                            if (existing) {
                                throw new common_1.ConflictException('A team already exists for this project');
                            }
                            return [4 /*yield*/, this.prisma.team.create({
                                    data: {
                                        name: dto.name,
                                        description: dto.description,
                                        projectId: dto.projectId,
                                        members: {
                                            create: dto.members.map(function (m) { return ({
                                                role: m.role,
                                                userId: m.userId,
                                                projectId: dto.projectId,
                                            }); }),
                                        },
                                    },
                                    include: {
                                        members: {
                                            include: {
                                                user: { select: { id: true, username: true, avatarUrl: true } },
                                            },
                                        },
                                    },
                                })];
                        case 3:
                            team = _a.sent();
                            return [2 /*return*/, this.format(team)];
                    }
                });
            });
        };
        TeamsService_1.prototype.update = function (teamId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var team, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.team.findUnique({ where: { id: teamId } })];
                        case 1:
                            team = _a.sent();
                            if (!team) {
                                throw new common_1.NotFoundException("Team with id \"".concat(teamId, "\" not found"));
                            }
                            return [4 /*yield*/, this.prisma.team.update({
                                    where: { id: teamId },
                                    data: { name: dto.name, description: dto.description },
                                    include: {
                                        members: {
                                            include: {
                                                user: { select: { id: true, username: true, avatarUrl: true } },
                                            },
                                        },
                                    },
                                })];
                        case 2:
                            updated = _a.sent();
                            return [2 /*return*/, this.format(updated)];
                    }
                });
            });
        };
        TeamsService_1.prototype.addMember = function (teamId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var team, existing, member;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.team.findUnique({ where: { id: teamId } })];
                        case 1:
                            team = _a.sent();
                            if (!team) {
                                throw new common_1.NotFoundException("Team with id \"".concat(teamId, "\" not found"));
                            }
                            return [4 /*yield*/, this.prisma.teamMember.findUnique({
                                    where: { userId_teamId: { userId: dto.userId, teamId: teamId } },
                                })];
                        case 2:
                            existing = _a.sent();
                            if (existing) {
                                throw new common_1.ConflictException('User is already a member of this team');
                            }
                            return [4 /*yield*/, this.prisma.teamMember.create({
                                    data: {
                                        teamId: teamId,
                                        userId: dto.userId,
                                        role: dto.role,
                                        projectId: team.projectId,
                                    },
                                    include: {
                                        user: { select: { id: true, username: true, avatarUrl: true } },
                                    },
                                })];
                        case 3:
                            member = _a.sent();
                            return [2 /*return*/, member];
                    }
                });
            });
        };
        TeamsService_1.prototype.updateMemberRole = function (memberId, role) {
            return __awaiter(this, void 0, void 0, function () {
                var member, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.teamMember.findUnique({ where: { id: memberId } })];
                        case 1:
                            member = _a.sent();
                            if (!member) {
                                throw new common_1.NotFoundException("Team member with id \"".concat(memberId, "\" not found"));
                            }
                            return [4 /*yield*/, this.prisma.teamMember.update({
                                    where: { id: memberId },
                                    data: { role: role },
                                    include: {
                                        user: { select: { id: true, username: true, avatarUrl: true } },
                                    },
                                })];
                        case 2:
                            updated = _a.sent();
                            return [2 /*return*/, updated];
                    }
                });
            });
        };
        TeamsService_1.prototype.removeMember = function (memberId) {
            return __awaiter(this, void 0, void 0, function () {
                var member;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.teamMember.findUnique({ where: { id: memberId } })];
                        case 1:
                            member = _a.sent();
                            if (!member) {
                                throw new common_1.NotFoundException("Team member with id \"".concat(memberId, "\" not found"));
                            }
                            if (member.role === client_1.TeamRole.OWNER) {
                                throw new common_1.ConflictException('Cannot remove the team owner');
                            }
                            return [4 /*yield*/, this.prisma.teamMember.delete({ where: { id: memberId } })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        TeamsService_1.prototype.remove = function (teamId) {
            return __awaiter(this, void 0, void 0, function () {
                var team;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.team.findUnique({ where: { id: teamId } })];
                        case 1:
                            team = _a.sent();
                            if (!team) {
                                throw new common_1.NotFoundException("Team with id \"".concat(teamId, "\" not found"));
                            }
                            return [4 /*yield*/, this.prisma.$transaction([
                                    this.prisma.teamMember.deleteMany({ where: { teamId: teamId } }),
                                    this.prisma.team.delete({ where: { id: teamId } }),
                                ])];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        TeamsService_1.prototype.format = function (team) {
            var _a;
            return {
                id: team.id,
                name: team.name,
                description: team.description,
                projectId: team.projectId,
                createdAt: team.createdAt instanceof Date ? team.createdAt.toISOString() : team.createdAt,
                updatedAt: team.updatedAt instanceof Date ? team.updatedAt.toISOString() : team.updatedAt,
                members: (_a = team.members) === null || _a === void 0 ? void 0 : _a.map(function (m) { return ({
                    id: m.id,
                    userId: m.userId,
                    role: m.role,
                    user: m.user,
                }); }),
            };
        };
        return TeamsService_1;
    }());
    __setFunctionName(_classThis, "TeamsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TeamsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TeamsService = _classThis;
}();
exports.TeamsService = TeamsService;
