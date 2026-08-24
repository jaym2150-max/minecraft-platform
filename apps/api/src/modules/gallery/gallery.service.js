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
exports.GalleryService = void 0;
var common_1 = require("@nestjs/common");
var client_s3_1 = require("@aws-sdk/client-s3");
var uuid_1 = require("uuid");
var client_1 = require("@prisma/client");
var IMAGE_SIGNATURES = {
    'image/png': [[0x89, 0x50, 0x4e, 0x47]],
    'image/jpeg': [[0xff, 0xd8, 0xff]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]],
};
var MAX_IMAGE_SIZE = 10 * 1024 * 1024;
var GalleryService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var GalleryService = _classThis = /** @class */ (function () {
        function GalleryService_1(prisma, config, imageProcessQueue) {
            this.prisma = prisma;
            this.config = config;
            this.imageProcessQueue = imageProcessQueue;
            this.logger = new common_1.Logger(GalleryService.name);
            this.endpoint = this.config.get('storage.endpoint');
            this.bucket = this.config.get('storage.bucket');
            this.publicBucket = this.config.get('storage.publicBucket');
            this.s3 = new client_s3_1.S3Client({
                endpoint: this.endpoint,
                region: this.config.get('storage.region'),
                credentials: {
                    accessKeyId: this.config.get('storage.accessKey'),
                    secretAccessKey: this.config.get('storage.secretKey'),
                },
                forcePathStyle: true,
            });
        }
        GalleryService_1.prototype.findByProject = function (slug) {
            return __awaiter(this, void 0, void 0, function () {
                var project;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({ where: { slug: slug }, select: { id: true } })];
                        case 1:
                            project = _a.sent();
                            if (!project)
                                throw new common_1.NotFoundException('Project not found');
                            return [2 /*return*/, this.prisma.galleryImage.findMany({
                                    where: { projectId: project.id },
                                    orderBy: { order: 'asc' },
                                })];
                    }
                });
            });
        };
        GalleryService_1.prototype.upload = function (projectSlug, userId, file, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var project, ext, itemId, objectKey, url, maxOrder, item;
                var _this = this;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({
                                where: { slug: projectSlug },
                                select: { id: true, authorId: true },
                            })];
                        case 1:
                            project = _d.sent();
                            if (!project)
                                throw new common_1.NotFoundException('Project not found');
                            if (project.authorId !== userId)
                                throw new common_1.ForbiddenException('Not your project');
                            if (file.size > MAX_IMAGE_SIZE) {
                                throw new common_1.BadRequestException('Image too large. Max 10MB');
                            }
                            if (!this.hasValidImageSignature(file)) {
                                throw new common_1.BadRequestException('Invalid image type. Only PNG, JPEG, WEBP, and GIF are allowed');
                            }
                            ext = this.getExtension(file);
                            itemId = (0, uuid_1.v4)();
                            objectKey = "gallery/".concat(project.id, "/").concat(itemId).concat(ext);
                            return [4 /*yield*/, this.s3.send(new client_s3_1.PutObjectCommand({
                                    Bucket: this.bucket,
                                    Key: objectKey,
                                    Body: file.buffer,
                                    ContentType: file.mimetype,
                                    Metadata: {
                                        'gallery-item-id': itemId,
                                        'project-id': project.id,
                                        'uploaded-by': userId,
                                    },
                                }))];
                        case 2:
                            _d.sent();
                            url = "".concat(this.endpoint, "/").concat(this.bucket, "/").concat(objectKey);
                            return [4 /*yield*/, this.prisma.galleryImage.aggregate({
                                    where: { projectId: project.id },
                                    _max: { order: true },
                                })];
                        case 3:
                            maxOrder = _d.sent();
                            return [4 /*yield*/, this.prisma.galleryImage.create({
                                    data: {
                                        id: itemId,
                                        type: (_a = dto.type) !== null && _a !== void 0 ? _a : client_1.GalleryItemType.IMAGE,
                                        url: url,
                                        alt: dto.alt,
                                        order: (_b = dto.order) !== null && _b !== void 0 ? _b : ((_c = maxOrder._max.order) !== null && _c !== void 0 ? _c : -1) + 1,
                                        projectId: project.id,
                                    },
                                })];
                        case 4:
                            item = _d.sent();
                            this.imageProcessQueue.add('process-image', {
                                buffer: file.buffer,
                                filename: "gallery/".concat(itemId).concat(ext),
                                mimeType: file.mimetype,
                            }).catch(function (err) {
                                return _this.logger.warn("Failed to enqueue image-process: ".concat(err.message));
                            });
                            return [2 /*return*/, item];
                    }
                });
            });
        };
        GalleryService_1.prototype.update = function (id, userId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var item;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.galleryImage.findUnique({ where: { id: id }, include: { project: { select: { authorId: true } } } })];
                        case 1:
                            item = _a.sent();
                            if (!item)
                                throw new common_1.NotFoundException('Gallery item not found');
                            if (item.project.authorId !== userId)
                                throw new common_1.ForbiddenException('Not your project');
                            return [2 /*return*/, this.prisma.galleryImage.update({
                                    where: { id: id },
                                    data: dto,
                                })];
                    }
                });
            });
        };
        GalleryService_1.prototype.remove = function (id, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var item, key, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.galleryImage.findUnique({ where: { id: id }, include: { project: { select: { authorId: true } } } })];
                        case 1:
                            item = _a.sent();
                            if (!item)
                                throw new common_1.NotFoundException('Gallery item not found');
                            if (item.project.authorId !== userId)
                                throw new common_1.ForbiddenException('Not your project');
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 5, , 6]);
                            key = this.extractKeyFromUrl(item.url);
                            if (!key) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.s3.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucket, Key: key }))];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [3 /*break*/, 6];
                        case 5:
                            err_1 = _a.sent();
                            this.logger.warn("Failed to delete S3 object for gallery item ".concat(id, ": ").concat(err_1.message));
                            return [3 /*break*/, 6];
                        case 6: return [4 /*yield*/, this.prisma.galleryImage.delete({ where: { id: id } })];
                        case 7:
                            _a.sent();
                            return [2 /*return*/, { message: 'Gallery item deleted' }];
                    }
                });
            });
        };
        GalleryService_1.prototype.reorder = function (projectSlug, userId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var project, updates;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.project.findUnique({
                                where: { slug: projectSlug },
                                select: { id: true, authorId: true },
                            })];
                        case 1:
                            project = _a.sent();
                            if (!project)
                                throw new common_1.NotFoundException('Project not found');
                            if (project.authorId !== userId)
                                throw new common_1.ForbiddenException('Not your project');
                            updates = dto.ids.map(function (id, index) {
                                return _this.prisma.galleryImage.updateMany({
                                    where: { id: id, projectId: project.id },
                                    data: { order: index },
                                });
                            });
                            return [4 /*yield*/, Promise.all(updates)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { message: 'Gallery reordered' }];
                    }
                });
            });
        };
        GalleryService_1.prototype.hasValidImageSignature = function (file) {
            var _a;
            var buf = file.buffer;
            if (!buf || buf.length < 4)
                return false;
            var signatures = (_a = IMAGE_SIGNATURES[file.mimetype]) !== null && _a !== void 0 ? _a : Object.values(IMAGE_SIGNATURES).flat();
            return signatures.some(function (bytes) { return bytes.every(function (b, i) { return buf[i] === b; }); });
        };
        GalleryService_1.prototype.getExtension = function (file) {
            var _a;
            var map = {
                'image/png': '.png',
                'image/jpeg': '.jpg',
                'image/webp': '.webp',
                'image/gif': '.gif',
            };
            return (_a = map[file.mimetype]) !== null && _a !== void 0 ? _a : '.bin';
        };
        GalleryService_1.prototype.extractKeyFromUrl = function (url) {
            var prefix = "".concat(this.endpoint, "/").concat(this.bucket, "/");
            if (url.startsWith(prefix))
                return url.slice(prefix.length);
            return null;
        };
        return GalleryService_1;
    }());
    __setFunctionName(_classThis, "GalleryService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        GalleryService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return GalleryService = _classThis;
}();
exports.GalleryService = GalleryService;
