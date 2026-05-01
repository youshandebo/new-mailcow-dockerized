"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    imap: {
        host: process.env.IMAP_HOST || 'dovecot-mailcow',
        port: parseInt(process.env.IMAP_PORT || '993', 10),
        tls: process.env.IMAP_TLS !== 'false',
    },
    smtp: {
        host: process.env.SMTP_HOST || 'postfix-mailcow',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        tls: process.env.SMTP_TLS !== 'false',
    },
    mailcow: {
        apiUrl: process.env.MAILCOW_API_URL || 'http://nginx-mailcow',
        apiKey: process.env.MAILCOW_API_KEY || '',
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    claude: {
        apiKey: process.env.CLAUDE_API_KEY || '',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'change-me-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
};
//# sourceMappingURL=index.js.map