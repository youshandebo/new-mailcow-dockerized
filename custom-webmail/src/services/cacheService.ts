import Redis from 'ioredis';
import crypto from 'crypto';
import { config } from '../config';
import { logger } from '../utils/logger';

class CacheService {
  private redis: Redis | null = null;

  async connect(): Promise<void> {
    try {
      this.redis = new Redis(config.redis.url, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => Math.min(times * 100, 3000),
        lazyConnect: true,
      });
      await this.redis.connect();
      logger.info('Redis connected');
    } catch (err: any) {
      logger.warn('Redis connection failed, caching disabled', { error: err.message });
      this.redis = null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (err: any) {
      logger.warn('Cache set failed', { error: err.message });
    }
  }

  async setPermanent(key: string, value: any): Promise<boolean> {
    if (!this.redis) return false;
    try {
      await this.redis.set(key, JSON.stringify(value));
      return true;
    } catch (err: any) {
      logger.warn('Cache setPermanent failed', { error: err.message });
      return false;
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.del(key);
    } catch {}
  }

  hashContent(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }
}

export const cacheService = new CacheService();
