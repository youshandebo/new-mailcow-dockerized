import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { imapService } from '../services/imapService';
import { mailcowApiService } from '../services/mailcowApiService';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Authenticate via mailcow's internal PHP auth endpoint
async function verifyCredentials(email: string, password: string): Promise<{ success: boolean; role?: string }> {
  try {
    const authUrl = process.env.MAILCOW_AUTH_URL || 'http://nginx-mailcow/webmail-auth.php';
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
    });
    if (response.ok) {
      const data = await response.json() as any;
      return { success: true, role: data.role };
    }
    return { success: false };
  } catch (err: any) {
    logger.error('Auth endpoint error', { error: err.message });
    return { success: false };
  }
}

router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Authenticate via mailcow PHP auth endpoint
    const authResult = await verifyCredentials(email, password);
    if (!authResult.success) {
      logger.info('Login failed - invalid credentials', { email });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT
    const user = { id: email, email, name: email.split('@')[0] };
    const token = jwt.sign(user, config.jwt.secret, { expiresIn: 24 * 60 * 60 });

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Establish persistent IMAP connection for email operations
    try {
      await imapService.connect(email, config.imap.host, config.imap.port, email, password, config.imap.tls);
    } catch (imapErr: any) {
      logger.warn('IMAP connection failed after auth (non-fatal)', { email, error: imapErr.message });
      // Don't fail login if IMAP connection fails - user can still use the UI
    }

    const isAdmin = await mailcowApiService.isDomainAdmin(email).catch(() => false);

    logger.info('User logged in', { email, role: authResult.role, isAdmin });
    res.json({ user, isAdmin });
  } catch (err: any) {
    logger.error('Login failed', { error: err.message });
    res.status(500).json({ error: 'Login failed' });
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
