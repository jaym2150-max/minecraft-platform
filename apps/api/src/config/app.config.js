"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("@nestjs/config");
var env_1 = require("../common/env");
exports.default = (0, config_1.registerAs)('app', function () {
    var _a;
    return ({
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.API_PORT || '4000', 10),
        apiUrl: process.env.API_URL || 'http://localhost:4000',
        webUrl: process.env.WEB_URL || 'http://localhost:3000',
        adminUrl: process.env.ADMIN_URL || 'http://localhost:3001',
        jwtSecret: (0, env_1.requireEnv)('JWT_SECRET', process.env.JWT_SECRET, ''),
        jwtExpiration: process.env.JWT_EXPIRATION || '15m',
        refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
        logLevel: process.env.LOG_LEVEL || 'debug',
        logFormat: process.env.LOG_FORMAT || 'pretty',
        githubClientId: process.env.GITHUB_CLIENT_ID || '',
        githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        discordClientId: process.env.DISCORD_CLIENT_ID || '',
        discordClientSecret: process.env.DISCORD_CLIENT_SECRET || '',
        tfaEncKey: process.env.TFA_ENC_KEY || '',
        stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
        stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
        useOAuthConsentCode: ((_a = process.env.OAUTH_USE_CONSENT_CODE) !== null && _a !== void 0 ? _a : 'true') !== 'false',
    });
});
