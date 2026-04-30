import client from './client';
import { Folder, Email, EmailDetail, EmailAddress } from '../types';

export const mailboxApi = {
  getFolders: async (): Promise<Folder[]> => {
    const res = await client.get('/mail/folders');
    return res.data.folders;
  },

  getEmails: async (folder: string, page = 1, pageSize = 50): Promise<{ emails: Email[]; total: number }> => {
    const res = await client.get(`/mail/emails/${encodeURIComponent(folder)}`, {
      params: { page, pageSize },
    });
    return res.data;
  },

  getEmail: async (folder: string, uid: number): Promise<EmailDetail> => {
    const res = await client.get(`/mail/email/${encodeURIComponent(folder)}/${uid}`);
    return res.data.email;
  },

  markAsRead: async (folder: string, uid: number): Promise<void> => {
    await client.post(`/mail/email/${encodeURIComponent(folder)}/${uid}/read`);
  },

  markAsUnread: async (folder: string, uid: number): Promise<void> => {
    await client.post(`/mail/email/${encodeURIComponent(folder)}/${uid}/unread`);
  },

  toggleFlag: async (folder: string, uid: number, flagged: boolean): Promise<void> => {
    await client.post(`/mail/email/${encodeURIComponent(folder)}/${uid}/flag`, { flagged });
  },

  deleteEmail: async (folder: string, uid: number): Promise<void> => {
    await client.delete(`/mail/email/${encodeURIComponent(folder)}/${uid}`);
  },

  moveEmail: async (fromFolder: string, uid: number, toFolder: string): Promise<void> => {
    await client.post(`/mail/email/${encodeURIComponent(fromFolder)}/${uid}/move`, { toFolder });
  },

  searchEmails: async (folder: string, query: string): Promise<number[]> => {
    const res = await client.get(`/mail/search/${encodeURIComponent(folder)}`, {
      params: { query },
    });
    return res.data.uids;
  },

  sendEmail: async (data: {
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    subject: string;
    htmlBody: string;
    textBody: string;
    attachments?: Array<{ filename: string; content: string; contentType: string }>;
    inReplyTo?: string;
    references?: string[];
  }): Promise<void> => {
    await client.post('/mail/send', data);
  },

  saveDraft: async (data: {
    to?: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    subject?: string;
    htmlBody?: string;
    textBody?: string;
    draftUid?: number;
  }): Promise<{ uid: number }> => {
    const res = await client.post('/mail/draft', data);
    return res.data;
  },
};
