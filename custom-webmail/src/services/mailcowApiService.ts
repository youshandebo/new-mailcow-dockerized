import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import { cacheService } from './cacheService';
import { MailcowDomain, MailcowMailbox } from '../types';

class MailcowApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.mailcow.apiUrl,
      headers: {
        'X-API-Key': config.mailcow.apiKey,
        'Content-Type': 'application/json',
        'Sec-Fetch-Dest': 'empty',
      },
      timeout: 30000,
    });
  }

  async getDomains(): Promise<MailcowDomain[]> {
    try {
      const res = await this.client.get('/api/v1/get/domain/all');
      return res.data;
    } catch (err: any) {
      logger.error('Failed to get domains', { error: err.message });
      throw err;
    }
  }

  async getMailboxes(domain?: string): Promise<MailcowMailbox[]> {
    try {
      const url = domain ? `/api/v1/get/mailbox/${domain}` : '/api/v1/get/mailbox/all';
      const res = await this.client.get(url);
      return res.data;
    } catch (err: any) {
      logger.error('Failed to get mailboxes', { error: err.message });
      throw err;
    }
  }

  async createMailbox(data: { local_part: string; domain: string; password: string; name?: string; quota?: number }): Promise<any> {
    try {
      const res = await this.client.post('/api/v1/add/mailbox', data);
      return res.data;
    } catch (err: any) {
      logger.error('Failed to create mailbox', { error: err.message });
      throw err;
    }
  }

  async getAliases(): Promise<any[]> {
    try {
      const res = await this.client.get('/api/v1/get/alias/all');
      return res.data;
    } catch (err: any) {
      logger.error('Failed to get aliases', { error: err.message });
      throw err;
    }
  }

  async getDomainAdmins(): Promise<any[]> {
    try {
      const res = await this.client.get('/api/v1/get/domain-admin/all');
      return res.data;
    } catch (err: any) {
      logger.error('Failed to get domain admins', { error: err.message });
      throw err;
    }
  }

  async getQuarantine(): Promise<any[]> {
    try {
      const res = await this.client.get('/api/v1/get/qitems/all');
      return res.data;
    } catch (err: any) {
      logger.error('Failed to get quarantine', { error: err.message });
      throw err;
    }
  }

  async isDomainAdmin(email: string): Promise<boolean> {
    const cacheKey = `admin:check:${email}`;
    try {
      const cached = await cacheService.get<boolean>(cacheKey);
      if (cached !== null) return cached;
      const admins = await this.getDomainAdmins();
      const result = admins.some((admin: any) => admin.username === email);
      await cacheService.set(cacheKey, result, 60);
      return result;
    } catch (err: any) {
      logger.error('Failed to check domain admin status', { error: err.message });
      return false;
    }
  }
}

export const mailcowApiService = new MailcowApiService();
