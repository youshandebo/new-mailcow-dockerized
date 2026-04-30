import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { mailcowApiService } from '../services/mailcowApiService';
import { logger } from '../utils/logger';

export async function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user?.email) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const isAdmin = await mailcowApiService.isDomainAdmin(req.user.email);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (err: any) {
    logger.error('Admin check failed', { error: err.message });
    return res.status(500).json({ error: 'Failed to verify admin status' });
  }
}
