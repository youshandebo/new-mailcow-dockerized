"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
class CacheService {
    constructor() {
        this.redis = null;
    }
    async connect() {
        try {
            this.redis = new ioredis_1.default(config_1.config.redis.url, {
                maxRetriesPerRequest: 3,
                retryStrategy: (times) => Math.min(times * 100, 3000),
                lazyConnect: true,
            });
            await this.redis.connect();
            logger_1.logger.info('Redis connected');
        }
        catch (err) {
            logger_1.logger.warn('Redis connection failed, caching disabled', { error: err.message });
            this.redis = null;
        }
    }
    async get(key) {
        if (!this.redis)
            return null;
        try {
            const data = await this.redis.get(key);
            return data ? JSON.parse(data) : null;
        }
        catch {
            return null;
        }
    }
    async set(key, value, ttlSeconds = 300) {
        if (!this.redis)
            return;
        try {
            await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
        }
        catch (err) {
            logger_1.logger.warn('Cache set failed', { error: err.message });
        }
    }
    async setPermanent(key, value) {
        if (!this.redis)
            return false;
        try {
            await this.redis.set(key, JSON.stringify(value));
            return true;
        }
        catch (err) {
            logger_1.logger.warn('Cache setPermanent failed', { error: err.message });
            return false;
        }
    }
    async del(key) {
        if (!this.redis)
            return;
        try {
            await this.redis.del(key);
        }
        catch { }
    }
    hashContent(content) {
        return crypto_1.default.createHash('sha256').update(content).digest('hex').substring(0, 16);
    }
    async disconnect() {
        if (this.redis) {
            await this.redis.quit();
            this.redis = null;
        }
    }
}
exports.cacheService = new CacheService();
//# sourceMappingURL=cacheService.js.map