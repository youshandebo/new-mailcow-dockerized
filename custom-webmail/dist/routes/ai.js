"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const claudeService_1 = require("../services/claudeService");
const cacheService_1 = require("../services/cacheService");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
// Smart Compose - streaming
router.post('/compose', async (req, res) => {
    try {
        const params = req.body;
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        });
        // Send initial padding to bypass proxy buffering
        res.write(' '.repeat(4096) + '\n');
        const heartbeat = setInterval(() => {
            res.write(': heartbeat\n\n');
        }, 15000);
        try {
            for await (const chunk of claudeService_1.claudeService.smartCompose(params)) {
                if (res.destroyed)
                    break;
                res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
            }
            res.write('data: [DONE]\n\n');
        }
        finally {
            clearInterval(heartbeat);
            res.end();
        }
    }
    catch (err) {
        logger_1.logger.error('AI compose failed', { error: err.message });
        if (!res.headersSent) {
            res.status(500).json({ error: 'AI compose failed' });
        }
        else {
            res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
        }
    }
});
// Email Summary
router.post('/summarize', async (req, res) => {
    try {
        const { subject, body, from } = req.body;
        // Check cache
        const cacheKey = `ai:summary:${cacheService_1.cacheService.hashContent(subject + body)}`;
        const cached = await cacheService_1.cacheService.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }
        const summary = await claudeService_1.claudeService.summarizeEmail({ subject, body, from });
        // Cache for 24 hours
        await cacheService_1.cacheService.set(cacheKey, summary, 86400);
        res.json(summary);
    }
    catch (err) {
        logger_1.logger.error('AI summarize failed', { error: err.message });
        res.status(500).json({ error: 'AI summarize failed' });
    }
});
// Email Classification
router.post('/classify', async (req, res) => {
    try {
        const { subject, body, from } = req.body;
        const cacheKey = `ai:class:${cacheService_1.cacheService.hashContent(subject + body)}`;
        const cached = await cacheService_1.cacheService.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }
        const classification = await claudeService_1.claudeService.classifyEmail({ subject, body, from });
        await cacheService_1.cacheService.set(cacheKey, classification, 86400);
        res.json(classification);
    }
    catch (err) {
        logger_1.logger.error('AI classify failed', { error: err.message });
        res.status(500).json({ error: 'AI classify failed' });
    }
});
// AI Chat - streaming
router.post('/chat', async (req, res) => {
    try {
        const { messages, context } = req.body;
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        });
        res.write(' '.repeat(4096) + '\n');
        const heartbeat = setInterval(() => {
            res.write(': heartbeat\n\n');
        }, 15000);
        let systemPrompt;
        if (context?.currentEmail) {
            systemPrompt = `You are a helpful email assistant. The user is currently viewing this email:\n\n${context.currentEmail}\n\nHelp them understand, respond to, or take action on this email. Be concise and helpful.`;
        }
        try {
            for await (const chunk of claudeService_1.claudeService.chat(messages, systemPrompt)) {
                if (res.destroyed)
                    break;
                res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
            }
            res.write('data: [DONE]\n\n');
        }
        finally {
            clearInterval(heartbeat);
            res.end();
        }
    }
    catch (err) {
        logger_1.logger.error('AI chat failed', { error: err.message });
        if (!res.headersSent) {
            res.status(500).json({ error: 'AI chat failed' });
        }
        else {
            res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
        }
    }
});
exports.default = router;
//# sourceMappingURL=ai.js.map