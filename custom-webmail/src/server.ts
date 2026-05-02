import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { logger } from './utils/logger';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { cacheService } from './services/cacheService';
import authRoutes from './routes/auth';
import mailboxRoutes from './routes/mailbox';
import aiRoutes from './routes/ai';
import settingsRoutes from './routes/settings';
import aiProxyRoutes from './routes/aiProxy';

const app = express();

// Trust proxy (behind nginx)
app.set('trust proxy', 1);

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
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
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/mail', authMiddleware, mailboxRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/ai-proxy', aiProxyRoutes);

// Error handler
app.use(errorHandler);

// Start server
async function start() {
  await cacheService.connect();

  // Load AI settings from Redis after connection
  const { claudeService } = await import('./services/claudeService');
  await claudeService.reloadSettings();

  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`, { env: config.nodeEnv });
  });
}

start().catch((err) => {
  logger.error('Failed to start server', { error: err.message });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  await cacheService.disconnect();
  process.exit(0);
});
