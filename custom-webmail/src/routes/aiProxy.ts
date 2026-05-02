import { Router, Request, Response, NextFunction } from 'express';
import { claudeService } from '../services/claudeService';
import { cacheService } from '../services/cacheService';
import { logger } from '../utils/logger';
import { ComposeParams, ChatMessage } from '../types';

const router = Router();

// Simple API key auth for SOGo integration
const AI_PROXY_KEY = process.env.AI_PROXY_KEY || 'mailcow-ai-2024';

function proxyAuth(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['x-ai-key'] as string;
  if (key !== AI_PROXY_KEY) {
    return res.status(401).json({ error: 'Invalid AI proxy key' });
  }
  next();
}

router.use(proxyAuth);

// Chat endpoint - streaming
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages, context }: { messages: ChatMessage[]; context?: { currentEmail?: string } } = req.body;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    res.write(' '.repeat(2048) + '\n');

    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 15000);

    let systemPrompt: string | undefined;
    if (context?.currentEmail) {
      systemPrompt = `You are a helpful email assistant. The user is currently viewing this email:\n\n${context.currentEmail}\n\nHelp them understand, respond to, or take action on this email. Be concise and helpful. Reply in the same language as the user's message.`;
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
    logger.error('AI proxy chat failed', { error: err.message });
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

// Summarize endpoint
router.post('/summarize', async (req: Request, res: Response) => {
  try {
    const { subject, body, from } = req.body;
    const cacheKey = `ai:summary:${cacheService.hashContent(subject + body)}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.json(cached);

    const summary = await claudeService.summarizeEmail({ subject, body, from });
    await cacheService.set(cacheKey, summary, 86400);
    res.json(summary);
  } catch (err: any) {
    logger.error('AI proxy summarize failed', { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// Compose endpoint - streaming
router.post('/compose', async (req: Request, res: Response) => {
  try {
    const params: ComposeParams = req.body;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    res.write(' '.repeat(2048) + '\n');

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
    logger.error('AI proxy compose failed', { error: err.message });
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

export default router;
