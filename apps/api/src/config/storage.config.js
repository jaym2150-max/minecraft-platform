"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("@nestjs/config");
var env_1 = require("../common/env");
exports.default = (0, config_1.registerAs)('storage', function () { return ({
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    region: process.env.S3_REGION || 'us-east-1',
    accessKey: (0, env_1.requireEnv)('S3_ACCESS_KEY', process.env.S3_ACCESS_KEY, ''),
    secretKey: (0, env_1.requireEnv)('S3_SECRET_KEY', process.env.S3_SECRET_KEY, ''),
    bucket: process.env.S3_BUCKET || 'uploads',
    publicBucket: process.env.S3_PUBLIC_BUCKET || 'public',
}); });
