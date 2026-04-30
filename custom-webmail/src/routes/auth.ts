import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { imapService } from '../services/imapService';
import { mailcowApiService } from '../services/mailcowApiService';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Authenticate via IMAP LOGIN
    await imapService.connect('temp-' + email, config.imap.host, config.imap.port, email, password, config.imap.tls);
    await imapService.disconnect('temp-' + email);

    // Create JWT
    const user = { id: email, email, name: email.split('@')[0] };
    const token = jwt.sign(user, config.jwt.secret, { expiresIn: 24 * 60 * 60 });

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Establish persistent IMAP connection
    await imapService.connect(email, config.imap.host, config.imap.port, email, password, config.imap.tls);

    const isAdmin = await mailcowApiService.isDomainAdmin(email).catch(() => false);

    logger.info('User logged in', { email, isAdmin });
    res.json({ user, isAdmin });
  } catch (err: any) {
    logger.error('Login failed', { error: err.message });
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.post('/logout', async (req: AuthRequest, res: Response) => {
  if (req.user) {
    await imapService.disconnect(req.user.email).catch(() => {});
  }
  res.clearCookie('token');
  res.json({ success: true });
});

router.get('/me', async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const isAdmin = await mailcowApiService.isDomainAdmin(req.user.email).catch(() => false);
  res.json({ user: req.user, isAdmin });
});

export default router;
