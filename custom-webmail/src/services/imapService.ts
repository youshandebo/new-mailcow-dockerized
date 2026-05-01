import { ImapFlow } from 'imapflow';
import { simpleParser, ParsedMail } from 'mailparser';
import sanitizeHtml from 'sanitize-html';
import { logger } from '../utils/logger';
import { Folder, Email, EmailDetail, ListOptions, SearchQuery } from '../types';

interface ConnectionEntry {
  client: ImapFlow;
  lastUsed: number;
}

class ImapService {
  private connections: Map<string, ConnectionEntry> = new Map();
  private readonly IDLE_TIMEOUT = 5 * 60 * 1000;

  constructor() {
    setInterval(() => this.cleanupIdleConnections(), 60 * 1000);
  }

  private cleanupIdleConnections() {
    const now = Date.now();
    for (const [userId, entry] of this.connections) {
      if (now - entry.lastUsed > this.IDLE_TIMEOUT) {
        entry.client.logout().catch(() => {});
        this.connections.delete(userId);
        logger.info('Cleaned up idle IMAP connection', { userId });
      }
    }
  }

  async connect(userId: string, host: string, port: number, user: string, password: string, tls: boolean): Promise<ImapFlow> {
    const existing = this.connections.get(userId);
    if (existing) {
      existing.lastUsed = Date.now();
      return existing.client;
    }

    const client = new ImapFlow({
      host,
      port,
      secure: tls,
      auth: { user, pass: password },
      logger: false,
      tls: { rejectUnauthorized: false },
    });

    await client.connect();
    this.connections.set(userId, { client, lastUsed: Date.now() });
    logger.info('IMAP connected', { userId, host });
    return client;
  }

  async disconnect(userId: string): Promise<void> {
    const entry = this.connections.get(userId);
    if (entry) {
      await entry.client.logout().catch(() => {});
      this.connections.delete(userId);
    }
  }

  private getClient(userId: string): ImapFlow {
    const entry = this.connections.get(userId);
    if (!entry) throw new Error('IMAP not connected');
    entry.lastUsed = Date.now();
    return entry.client;
  }

  async listFolders(userId: string): Promise<Folder[]> {
    const client = this.getClient(userId);
    const folders: Folder[] = [];

    const list = await client.list();
    for (const item of list) {
      const mailbox = await client.status(item.path, { messages: true, unseen: true }).catch(() => null);
      folders.push({
        name: item.name,
        path: item.path,
        delimiter: item.delimiter || '/',
        total: mailbox?.messages || 0,
        unread: mailbox?.unseen || 0,
        specialUse: (item as any).specialUse,
      });
    }

    return folders;
  }

  async listEmails(userId: string, folder: string, options: ListOptions = {}): Promise<{ emails: Email[]; total: number }> {
    const client = this.getClient(userId);
    const lock = await client.getMailboxLock(folder);

    try {
      const mailbox = client.mailbox as any;
      const total = mailbox?.exists || 0;
      const pageSize = options.pageSize || 50;
      const page = options.page || 1;
      const start = total - (page * pageSize) + 1;
      const end = total - ((page - 1) * pageSize);

      if (start > total || start < 1) {
        return { emails: [], total };
      }

      const emails: Email[] = [];
      const range = `${Math.max(1, start)}:${end}`;

      for await (const message of client.fetch(range, {
        uid: true,
        envelope: true,
        flags: true,
        bodyStructure: true,
      })) {
        const msg = message as any;
        const envelope = msg.envelope;
        if (!envelope) continue;

        const isRead = msg.flags?.has('\\Seen') || false;
        const isFlagged = msg.flags?.has('\\Flagged') || false;
        const hasAttachments = this.checkHasAttachments(msg.bodyStructure);

        emails.push({
          uid: msg.uid,
          messageId: envelope.messageId || '',
          subject: envelope.subject || '(no subject)',
          from: (envelope.from || []).map((a: any) => ({ name: a.name || '', address: a.address || '' })),
          to: (envelope.to || []).map((a: any) => ({ name: a.name || '', address: a.address || '' })),
          cc: (envelope.cc || []).map((a: any) => ({ name: a.name || '', address: a.address || '' })),
          date: envelope.date?.toISOString() || new Date().toISOString(),
          preview: '',
          isRead,
          isFlagged,
          hasAttachments,
        });
      }

      emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return { emails, total };
    } finally {
      lock.release();
    }
  }

  async getEmail(userId: string, folder: string, uid: number): Promise<EmailDetail> {
    const client = this.getClient(userId);
    const lock = await client.getMailboxLock(folder);

    try {
      const message = await client.fetchOne(uid, { source: true, uid: true, envelope: true, flags: true }, { uid: true });
      const msg = message as any;
      if (!msg?.source) throw new Error('Email not found');

      const parsed: ParsedMail = await simpleParser(msg.source);
      const htmlBody = parsed.html ? sanitizeHtml(parsed.html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'style']),
        allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt', 'width', 'height'], a: ['href', 'target'] },
      }) : '';
      const textBody = parsed.text || '';

      const envelope = msg.envelope;

      return {
        uid: msg.uid,
        messageId: envelope?.messageId || '',
        subject: envelope?.subject || '(no subject)',
        from: (envelope?.from || []).map((a: any) => ({ name: a.name || '', address: a.address || '' })),
        to: (envelope?.to || []).map((a: any) => ({ name: a.name || '', address: a.address || '' })),
        cc: (envelope?.cc || []).map((a: any) => ({ name: a.name || '', address: a.address || '' })),
        date: envelope?.date?.toISOString() || new Date().toISOString(),
        preview: textBody.substring(0, 200),
        isRead: msg.flags?.has('\\Seen') || false,
        isFlagged: msg.flags?.has('\\Flagged') || false,
        hasAttachments: parsed.attachments.length > 0,
        attachments: parsed.attachments.map((a, i) => ({
          id: `att-${i}`,
          filename: a.filename || 'attachment',
          contentType: a.contentType || 'application/octet-stream',
          size: a.size,
          contentId: a.contentId,
        })),
        htmlBody,
        textBody,
        replyTo: envelope?.replyTo?.map((a: any) => ({ name: a.name || '', address: a.address || '' })),
        headers: Object.fromEntries(parsed.headers as any),
      };
    } finally {
      lock.release();
    }
  }

  async markAsRead(userId: string, folder: string, uid: number): Promise<void> {
    const client = this.getClient(userId);
    const lock = await client.getMailboxLock(folder);
    try {
      await client.messageFlagsAdd({ uid }, ['\\Seen'], { uid: true });
    } finally {
      lock.release();
    }
  }

  async markAsUnread(userId: string, folder: string, uid: number): Promise<void> {
    const client = this.getClient(userId);
    const lock = await client.getMailboxLock(folder);
    try {
      await client.messageFlagsRemove({ uid }, ['\\Seen'], { uid: true });
    } finally {
      lock.release();
    }
  }

  async toggleFlag(userId: string, folder: string, uid: number, flagged: boolean): Promise<void> {
    const client = this.getClient(userId);
    const lock = await client.getMailboxLock(folder);
    try {
      if (flagged) {
        await client.messageFlagsAdd({ uid }, ['\\Flagged'], { uid: true });
      } else {
        await client.messageFlagsRemove({ uid }, ['\\Flagged'], { uid: true });
      }
    } finally {
      lock.release();
    }
  }

  async deleteEmail(userId: string, folder: string, uid: number): Promise<void> {
    const client = this.getClient(userId);
    const lock = await client.getMailboxLock(folder);
    try {
      await client.messageFlagsAdd({ uid }, ['\\Deleted'], { uid: true });
      await (client as any).expunge();
    } finally {
      lock.release();
    }
  }

  async moveEmail(userId: string, fromFolder: string, uid: number, toFolder: string): Promise<void> {
    const client = this.getClient(userId);
    const lock = await client.getMailboxLock(fromFolder);
    try {
      await client.messageMove({ uid }, toFolder, { uid: true });
    } finally {
      lock.release();
    }
  }

  async appendEmail(userId: string, folder: string, rawEmail: Buffer, flags: string[] = []): Promise<number> {
    const client = this.getClient(userId);
    const result = await client.append(folder, rawEmail, flags);
    return (result as any).uid || 0;
  }

  async searchEmails(userId: string, folder: string, query: SearchQuery): Promise<number[]> {
    const client = this.getClient(userId);
    const lock = await client.getMailboxLock(folder);
    try {
      const searchCriteria: any = {};
      if (query.query) searchCriteria.text = query.query;
      if (query.from) searchCriteria.from = query.from;
      if (query.to) searchCriteria.to = query.to;
      if (query.subject) searchCriteria.subject = query.subject;
      if (query.since) searchCriteria.since = new Date(query.since);
      if (query.before) searchCriteria.before = new Date(query.before);

      const uids = await client.search(searchCriteria, { uid: true });
      return Array.isArray(uids) ? uids : [];
    } finally {
      lock.release();
    }
  }

  private checkHasAttachments(bodyStructure: any): boolean {
    if (!bodyStructure) return false;
    if (bodyStructure.disposition === 'attachment') return true;
    if (bodyStructure.childNodes) {
      return bodyStructure.childNodes.some((child: any) => this.checkHasAttachments(child));
    }
    return false;
  }
}

export const imapService = new ImapService();
