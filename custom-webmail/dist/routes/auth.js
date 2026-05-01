"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const imapService_1 = require("../services/imapService");
const mailcowApiService_1 = require("../services/mailcowApiService");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        // Authenticate via IMAP LOGIN
        await imapService_1.imapService.connect('temp-' + email, config_1.config.imap.host, config_1.config.imap.port, email, password, config_1.config.imap.tls);
        await imapService_1.imapService.disconnect('temp-' + email);
        // Create JWT
        const user = { id: email, email, name: email.split('@')[0] };
        const token = jsonwebtoken_1.default.sign(user, config_1.config.jwt.secret, { expiresIn: 24 * 60 * 60 });
        res.cookie('token', token, {
            httpOnly: true,
            secure: config_1.config.nodeEnv === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });
        // Establish persistent IMAP connection
        await imapService_1.imapService.connect(email, config_1.config.imap.host, config_1.config.imap.port, email, password, config_1.config.imap.tls);
        const isAdmin = await mailcowApiService_1.mailcowApiService.isDomainAdmin(email).catch(() => false);
        logger_1.logger.info('User logged in', { email, isAdmin });
        res.json({ user, isAdmin });
    }
    catch (err) {
        logger_1.logger.error('Login failed', { error: err.message, code: err.code, stack: err.stack?.substring(0, 300) });
        res.status(401).json({ error: 'Invalid credentials' });
    }
});
router.post('/logout', async (req, res) => {
    if (req.user) {
        await imapService_1.imapService.disconnect(req.user.email).catch(() => { });
    }
    res.clearCookie('token');
    res.json({ success: true });
});
router.get('/me', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const isAdmin = await mailcowApiService_1.mailcowApiService.isDomainAdmin(req.user.email).catch(() => false);
    res.json({ user: req.user, isAdmin });
});
exports.default = router;
//# sourceMappingURL=auth.js.map