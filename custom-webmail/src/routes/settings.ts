import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { claudeService } from '../services/claudeService';
import { cacheService } from '../services/cacheService';
import { logger } from '../utils/logger';
import { AiSettings } from '../types';

const SETTINGS_KEY = 'ai:settings';
const router = Router();

// All settings routes require admin
router.use(adminMiddleware);

// Get current AI settings
router.get('/ai', async (_req: AuthRequest, res: Response) => {
  try {
    const settings = claudeService.getMaskedSettings();
    res.json({ settings });
  } catch (err: any) {
    logger.error('Failed to get AI settings', { error: err.message });
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Update AI settings
router.put('/ai', async (req: AuthRequest, res: Response) => {
  try {
    const updates: Partial<AiSettings> = req.body;

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

    const tokenFields = ['maxTokensCompose', 'maxTokensChat', 'maxTokensSummarize', 'maxTokensClassify'] as const;
    for (const field of tokenFields) {
      if (updates[field] !== undefined) {
        const val = Number(updates[field]);
        if (!Number.isInteger(val) || val < 1 || val > 100000) {
          return res.status(400).json({ error: `${field} 必须是 1-100000 之间的整数` });
        }
        (updates as any)[field] = val;
      }
    }

    // Merge with existing settings
    const current = claudeService.getSettings();
    const merged: AiSettings = {
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
    const saved = await cacheService.setPermanent(SETTINGS_KEY, merged);
    if (!saved) {
      return res.status(500).json({ error: '保存到存储失败' });
    }

    // Hot-reload
    await claudeService.reloadSettings();

    const settings = claudeService.getMaskedSettings();
    logger.info('AI settings updated', { model: settings.model });
    res.json({ settings, message: '设置已保存' });
  } catch (err: any) {
    logger.error('Failed to update AI settings', { error: err.message });
    res.status(500).json({ error: '保存设置失败' });
  }
});

// Test AI connection
router.post('/ai/test', async (_req: AuthRequest, res: Response) => {
  try {
    const result = await claudeService.testConnection();
    if (result.success) {
      res.json({ success: true, message: '连接成功' });
    } else {
      logger.warn('AI connection test failed', { error: result.error });
      res.json({ success: false, error: '连接失败，请检查 API Key 和模型配置' });
    }
  } catch (err: any) {
    logger.error('AI connection test failed', { error: err.message });
    res.status(500).json({ success: false, error: '连接测试失败，请检查配置' });
  }
});

export default router;
