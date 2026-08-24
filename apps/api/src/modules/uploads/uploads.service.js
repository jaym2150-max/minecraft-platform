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
exports.UploadsService = void 0;
var common_1 = require("@nestjs/common");
var uuid_1 = require("uuid");
var client_s3_1 = require("@aws-sdk/client-s3");
var crypto_1 = require("crypto");
var sanitize_filename_1 = require("../../common/utils/sanitize-filename");
var UploadsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var UploadsService = _classThis = /** @class */ (function () {
        function UploadsService_1(prisma, config, virusScanQueue) {
            var _a;
            this.prisma = prisma;
            this.config = config;
            this.virusScanQueue = virusScanQueue;
            this.logger = new common_1.Logger(UploadsService.name);
            this.maxFileSize =
                (_a = this.config.get('MAX_UPLOAD_SIZE')) !== null && _a !== void 0 ? _a : 50 * 1024 * 1024;
            this.endpoint = this.config.get('storage.endpoint');
            this.bucket = this.config.get('storage.bucket');
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
        /**
         * Verify the file by its magic bytes rather than the (spoofable) MIME header.
         * Returns true if the leading bytes match a known archive signature.
         */
        UploadsService_1.prototype.hasValidSignature = function (file) {
            var buf = file.buffer;
            if (!buf || buf.length < 4)
                return false;
            return UploadsService.ALLOWED_SIGNATURES.some(function (_a) {
                var bytes = _a.bytes;
                return bytes.every(function (b, i) { return buf[i] === b; });
            });
        };
        UploadsService_1.prototype.initiateUpload = function (userId, projectId, file) {
            return __awaiter(this, void 0, void 0, function () {
                var project, hash, uploadId, safeName, objectKey, fileUrl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (file.size > this.maxFileSize) {
                                throw new common_1.BadRequestException("File too large. Max size is ".concat(this.maxFileSize / 1024 / 1024, "MB"));
                            }
                            if (file.size === 0) {
                                throw new common_1.BadRequestException('File is empty');
                            }
                            // Verify the file by its actual content (magic bytes), not the client-
                            // supplied MIME type which can be trivially spoofed.
                            if (!this.hasValidSignature(file)) {
                                throw new common_1.BadRequestException('Invalid file type. Only .jar and .zip archives are allowed.');
                            }
                            return [4 /*yield*/, this.prisma.project.findUnique({
                                    where: { id: projectId },
                                    select: { id: true, authorId: true },
                                })];
                        case 1:
                            project = _a.sent();
                            if (!project) {
                                throw new common_1.BadRequestException("Project with id \"".concat(projectId, "\" not found"));
                            }
                            if (project.authorId !== userId) {
                                throw new common_1.ForbiddenException('You can only upload files to your own projects');
                            }
                            hash = (0, crypto_1.createHash)('sha256').update(file.buffer).digest('hex');
                            uploadId = (0, uuid_1.v4)();
                            safeName = (0, sanitize_filename_1.sanitizeObjectKey)(file.originalname);
                            objectKey = "projects/".concat(projectId, "/uploads/").concat(uploadId, "-").concat(safeName);
                            this.logger.log("Upload initiated: ".concat(uploadId, " for project ").concat(projectId, " by user ").concat(userId, " (").concat(file.size, " bytes)"));
                            // Stream the buffer directly to object storage here. The buffer lives only
                            // in-process and is never serialized into a BullMQ job (which would drop it
                            // / balloon Redis memory). Downstream workers operate on the stored object.
                            return [4 /*yield*/, this.s3.send(new client_s3_1.PutObjectCommand({
                                    Bucket: this.bucket,
                                    Key: objectKey,
                                    Body: file.buffer,
                                    ContentType: 'application/java-archive',
                                    Metadata: {
                                        'upload-id': uploadId,
                                        'project-id': projectId,
                                        sha256: hash,
                                        'original-filename': safeName,
                                        'uploaded-by': userId,
                                    },
                                }))];
                        case 2:
                            // Stream the buffer directly to object storage here. The buffer lives only
                            // in-process and is never serialized into a BullMQ job (which would drop it
                            // / balloon Redis memory). Downstream workers operate on the stored object.
                            _a.sent();
                            fileUrl = "".concat(this.endpoint, "/").concat(this.bucket, "/").concat(objectKey);
                            // Enqueue a virus scan. The worker reads the object back from storage; no
                            // buffer is passed through Redis.
                            return [4 /*yield*/, this.virusScanQueue.add('scan-upload', {
                                    uploadId: uploadId,
                                    projectId: projectId,
                                    userId: userId,
                                    filename: safeName,
                                    size: file.size,
                                    objectKey: objectKey,
                                    fileUrl: fileUrl,
                                    hash: "sha256:".concat(hash),
                                }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } })];
                        case 3:
                            // Enqueue a virus scan. The worker reads the object back from storage; no
                            // buffer is passed through Redis.
                            _a.sent();
                            return [2 /*return*/, {
                                    uploadId: uploadId,
                                    objectKey: objectKey,
                                    fileUrl: fileUrl,
                                    filename: safeName,
                                    size: file.size,
                                    hash: "sha256:".concat(hash),
                                    status: 'uploaded',
                                    scanStatus: 'pending',
                                    message: 'Upload stored and queued for malware scanning',
                                }];
                    }
                });
            });
        };
        UploadsService_1.prototype.getUploadStatus = function (uploadId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var job, state;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.virusScanQueue.getJob(uploadId)];
                        case 1:
                            job = _b.sent();
                            if (!job) {
                                return [2 /*return*/, { uploadId: uploadId, status: 'unknown' }];
                            }
                            // Do not leak other users' upload metadata.
                            if (((_a = job.data) === null || _a === void 0 ? void 0 : _a.userId) && job.data.userId !== userId) {
                                throw new common_1.NotFoundException("Upload with id \"".concat(uploadId, "\" not found"));
                            }
                            return [4 /*yield*/, job.getState()];
                        case 2:
                            state = _b.sent();
                            return [2 /*return*/, {
                                    uploadId: uploadId,
                                    status: state,
                                    progress: job.progress,
                                    processedOn: job.processedOn,
                                    finishedOn: job.finishedOn,
                                    failedReason: job.failedReason,
                                    returnvalue: job.returnvalue,
                                }];
                    }
                });
            });
        };
        UploadsService_1.prototype.cancelUpload = function (uploadId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var job;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.virusScanQueue.getJob(uploadId)];
                        case 1:
                            job = _b.sent();
                            if (!job) return [3 /*break*/, 3];
                            if (((_a = job.data) === null || _a === void 0 ? void 0 : _a.userId) && job.data.userId !== userId) {
                                throw new common_1.ForbiddenException('You can only cancel your own uploads');
                            }
                            return [4 /*yield*/, job.remove()];
                        case 2:
                            _b.sent();
                            this.logger.log("Upload ".concat(uploadId, " cancelled by user ").concat(userId));
                            _b.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return UploadsService_1;
    }());
    __setFunctionName(_classThis, "UploadsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UploadsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    /**
     * Allowed file signatures (magic bytes) for Minecraft mod uploads.
     * JAR files are structurally ZIP archives (PK\x03\x04), so both the
     * empty-archive (PK\x05\x06) and spanned (PK\x07\x08) signatures are accepted.
     * Validation is done by inspecting the actual file bytes, NOT the client-
     * supplied MIME type (which is trivially spoofable).
     */
    _classThis.ALLOWED_SIGNATURES = [
        { bytes: [0x50, 0x4b, 0x03, 0x04], description: 'ZIP / JAR archive' },
        { bytes: [0x50, 0x4b, 0x05, 0x06], description: 'empty ZIP / JAR archive' },
        { bytes: [0x50, 0x4b, 0x07, 0x08], description: 'spanned ZIP / JAR archive' },
    ];
    (function () {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UploadsService = _classThis;
}();
exports.UploadsService = UploadsService;
