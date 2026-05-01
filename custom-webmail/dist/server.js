"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const auth_1 = require("./middleware/auth");
const errorHandler_1 = require("./middleware/errorHandler");
const cacheService_1 = require("./services/cacheService");
const auth_2 = __importDefault(require("./routes/auth"));
const mailbox_1 = __importDefault(require("./routes/mailbox"));
const ai_1 = __importDefault(require("./routes/ai"));
const settings_1 = __importDefault(require("./routes/settings"));
const app = (0, express_1.default)();
// Trust proxy (behind nginx)
app.set('trust proxy', 1);
// Security
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Public routes
app.use('/api/auth', auth_2.default);
// Protected routes
app.use('/api/mail', auth_1.authMiddleware, mailbox_1.default);
app.use('/api/ai', auth_1.authMiddleware, ai_1.default);
app.use('/api/settings', auth_1.authMiddleware, settings_1.default);
// Error handler
app.use(errorHandler_1.errorHandler);
// Start server
async function start() {
    await cacheService_1.cacheService.connect();
    // Load AI settings from Redis after connection
    const { claudeService } = await Promise.resolve().then(() => __importStar(require('./services/claudeService')));
    await claudeService.reloadSettings();
    app.listen(config_1.config.port, () => {
        logger_1.logger.info(`Server running on port ${config_1.config.port}`, { env: config_1.config.nodeEnv });
    });
}
start().catch((err) => {
    logger_1.logger.error('Failed to start server', { error: err.message });
    process.exit(1);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received, shutting down...');
    await cacheService_1.cacheService.disconnect();
    process.exit(0);
});
//# sourceMappingURL=server.js.map