"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_1 = require("../middleware/admin");
const claudeService_1 = require("../services/claudeService");
const cacheService_1 = require("../services/cacheService");
const logger_1 = require("../utils/logger");
const SETTINGS_KEY = 'ai:settings';
const router = (0, express_1.Router)();
// All settings routes require admin
router.use(admin_1.adminMiddleware);
// Get current AI settings
router.get('/ai', async (_req, res) => {
    try {
        const settings = claudeService_1.claudeService.getMaskedSettings();
        res.json({ settings });
    }
    catch (err) {
        logger_1.logger.error('Failed to get AI settings', { error: err.message });
        res.status(500).json({ error: 'Failed to get settings' });
    }
});
// Update AI settings
router.put('/ai', async (req, res) => {
    try {
        const updates = req.body;
        // Validate
        if (updates.model !== undefined && (!updates.model || typeof updates.model !== 'string')) {
            return res.status(400).json({ error: '模型 ID 不能为空' });
        }
        if (updates.apiKey !== undefined && (!updates.apiKey || typeof updates.apiKey !== 'string')) {
            return res.status(400).json({ error: 'API Key 不能为空' });
        }
        if (updates.baseUrl !== undefined && typeof updates.baseUrl !== 'string') {
            return res.status(400).json({ error: 'Base URL 格式不正确' });
        }
        if (updates.provider !== undefined && !['openai', 'claude'].includes(updates.provider)) {
            return res.status(400).json({ error: 'Provider 必须是 openai 或 claude' });
        }
        const tokenFields = ['maxTokensCompose', 'maxTokensChat', 'maxTokensSummarize', 'maxTokensClassify'];
        for (const field of tokenFields) {
            if (updates[field] !== undefined) {
                const val = Number(updates[field]);
                if (!Number.isInteger(val) || val < 1 || val > 100000) {
                    return res.status(400).json({ error: `${field} 必须是 1-100000 之间的整数` });
                }
                updates[field] = val;
            }
        }
        // Merge with existing settings
        const current = claudeService_1.claudeService.getSettings();
        const merged = {
            provider: updates.provider !== undefined ? updates.provider : (current.provider || 'claude'),
            apiKey: updates.apiKey !== undefined ? updates.apiKey : current.apiKey,
            model: updates.model !== undefined ? updates.model : current.model,
            baseUrl: updates.baseUrl !== undefined ? updates.baseUrl : current.baseUrl,
            maxTokensCompose: updates.maxTokensCompose ?? current.maxTokensCompose,
            maxTokensChat: updates.maxTokensChat ?? current.maxTokensChat,
            maxTokensSummarize: updates.maxTokensSummarize ?? current.maxTokensSummarize,
            maxTokensClassify: updates.maxTokensClassify ?? current.maxTokensClassify,
        };
        // Persist to Redis
        const saved = await cacheService_1.cacheService.setPermanent(SETTINGS_KEY, merged);
        if (!saved) {
            return res.status(500).json({ error: '保存到存储失败' });
        }
        // Hot-reload
        await claudeService_1.claudeService.reloadSettings();
        const settings = claudeService_1.claudeService.getMaskedSettings();
        logger_1.logger.info('AI settings updated', { model: settings.model });
        res.json({ settings, message: '设置已保存' });
    }
    catch (err) {
        logger_1.logger.error('Failed to update AI settings', { error: err.message });
        res.status(500).json({ error: '保存设置失败' });
    }
});
// Test AI connection
router.post('/ai/test', async (_req, res) => {
    try {
        const result = await claudeService_1.claudeService.testConnection();
        if (result.success) {
            res.json({ success: true, message: '连接成功' });
        }
        else {
            logger_1.logger.warn('AI connection test failed', { error: result.error });
            res.json({ success: false, error: '连接失败，请检查 API Key 和模型配置' });
        }
    }
    catch (err) {
        logger_1.logger.error('AI connection test failed', { error: err.message });
        res.status(500).json({ success: false, error: '连接测试失败，请检查配置' });
    }
});
exports.default = router;
//# sourceMappingURL=settings.js.map