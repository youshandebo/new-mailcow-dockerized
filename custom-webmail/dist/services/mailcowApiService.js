"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailcowApiService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const cacheService_1 = require("./cacheService");
class MailcowApiService {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: config_1.config.mailcow.apiUrl,
            headers: {
                'X-API-Key': config_1.config.mailcow.apiKey,
                'Content-Type': 'application/json',
                'Sec-Fetch-Dest': 'empty',
            },
            timeout: 30000,
        });
    }
    async getDomains() {
        try {
            const res = await this.client.get('/api/v1/get/domain/all');
            return res.data;
        }
        catch (err) {
            logger_1.logger.error('Failed to get domains', { error: err.message });
            throw err;
        }
    }
    async getMailboxes(domain) {
        try {
            const url = domain ? `/api/v1/get/mailbox/${domain}` : '/api/v1/get/mailbox/all';
            const res = await this.client.get(url);
            return res.data;
        }
        catch (err) {
            logger_1.logger.error('Failed to get mailboxes', { error: err.message });
            throw err;
        }
    }
    async createMailbox(data) {
        try {
            const res = await this.client.post('/api/v1/add/mailbox', data);
            return res.data;
        }
        catch (err) {
            logger_1.logger.error('Failed to create mailbox', { error: err.message });
            throw err;
        }
    }
    async getAliases() {
        try {
            const res = await this.client.get('/api/v1/get/alias/all');
            return res.data;
        }
        catch (err) {
            logger_1.logger.error('Failed to get aliases', { error: err.message });
            throw err;
        }
    }
    async getDomainAdmins() {
        try {
            const res = await this.client.get('/api/v1/get/domain-admin/all');
            return res.data;
        }
        catch (err) {
            logger_1.logger.error('Failed to get domain admins', { error: err.message });
            throw err;
        }
    }
    async getQuarantine() {
        try {
            const res = await this.client.get('/api/v1/get/qitems/all');
            return res.data;
        }
        catch (err) {
            logger_1.logger.error('Failed to get quarantine', { error: err.message });
            throw err;
        }
    }
    async isDomainAdmin(email) {
        const cacheKey = `admin:check:${email}`;
        try {
            const cached = await cacheService_1.cacheService.get(cacheKey);
            if (cached !== null)
                return cached;
            const admins = await this.getDomainAdmins();
            const result = admins.some((admin) => admin.username === email);
            await cacheService_1.cacheService.set(cacheKey, result, 60);
            return result;
        }
        catch (err) {
            logger_1.logger.error('Failed to check domain admin status', { error: err.message });
            return false;
        }
    }
}
exports.mailcowApiService = new MailcowApiService();
//# sourceMappingURL=mailcowApiService.js.map