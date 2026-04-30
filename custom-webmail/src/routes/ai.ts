import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { claudeService } from '../services/claudeService';
import { cacheService } from '../services/cacheService';
import { logger } from '../utils/logger';
import { ComposeParams, ChatMessage } from '../types';

const router = Router();

// Smart Compose - streaming
router.post('/compose', async (req: AuthRequest, res: Response) => {
  try {
    const params: ComposeParams = req.body;

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
      for await (const chunk of claudeService.smartCompose(params)) {
        if (res.destroyed) break;
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
    } finally {
      clearInterval(heartbeat);
      res.end();
    }
  } catch (err: any) {
    logger.error('AI compose failed', { error: err.message });
    if (!res.headersSent) {
      res.status(500).json({ error: 'AI compose failed' });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

// Email Summary
router.post('/summarize', async (req: AuthRequest, res: Response) => {
  try {
    const { subject, body, from } = req.body;

    // Check cache
    const cacheKey = `ai:summary:${cacheService.hashContent(subject + body)}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const summary = await claudeService.summarizeEmail({ subject, body, from });

    // Cache for 24 hours
    await cacheService.set(cacheKey, summary, 86400);

    res.json(summary);
  } catch (err: any) {
    logger.error('AI summarize failed', { error: err.message });
    res.status(500).json({ error: 'AI summarize failed' });
  }
});

// Email Classification
router.post('/classify', async (req: AuthRequest, res: Response) => {
  try {
    const { subject, body, from } = req.body;

    const cacheKey = `ai:class:${cacheService.hashContent(subject + body)}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const classification = await claudeService.classifyEmail({ subject, body, from });

    await cacheService.set(cacheKey, classification, 86400);

    res.json(classification);
  } catch (err: any) {
    logger.error('AI classify failed', { error: err.message });
    res.status(500).json({ error: 'AI classify failed' });
  }
});

// AI Chat - streaming
router.post('/chat', async (req: AuthRequest, res: Response) => {
  try {
    const { messages, context }: { messages: ChatMessage[]; context?: { currentEmail?: string } } = req.body;

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

    let systemPrompt: string | undefined;
    if (context?.currentEmail) {
      systemPrompt = `You are a helpful email assistant. The user is currently viewing this email:\n\n${context.currentEmail}\n\nHelp them understand, respond to, or take action on this email. Be concise and helpful.`;
    }

    try {
      for await (const chunk of claudeService.chat(messages, systemPrompt)) {
        if (res.destroyed) break;
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
    } finally {
      clearInterval(heartbeat);
      res.end();
    }
  } catch (err: any) {
    logger.error('AI chat failed', { error: err.message });
    if (!res.headersSent) {
      res.status(500).json({ error: 'AI chat failed' });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

export default router;
