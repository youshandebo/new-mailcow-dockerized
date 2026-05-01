"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imapService = void 0;
const imapflow_1 = require("imapflow");
const mailparser_1 = require("mailparser");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const logger_1 = require("../utils/logger");
class ImapService {
    constructor() {
        this.connections = new Map();
        this.IDLE_TIMEOUT = 5 * 60 * 1000;
        setInterval(() => this.cleanupIdleConnections(), 60 * 1000);
    }
    cleanupIdleConnections() {
        const now = Date.now();
        for (const [userId, entry] of this.connections) {
            if (now - entry.lastUsed > this.IDLE_TIMEOUT) {
                entry.client.logout().catch(() => { });
                this.connections.delete(userId);
                logger_1.logger.info('Cleaned up idle IMAP connection', { userId });
            }
        }
    }
    async connect(userId, host, port, user, password, tls) {
        const existing = this.connections.get(userId);
        if (existing) {
            existing.lastUsed = Date.now();
            return existing.client;
        }
        const client = new imapflow_1.ImapFlow({
            host,
            port,
            secure: tls,
            auth: { user, pass: password },
            logger: false,
            tls: { rejectUnauthorized: false },
        });
        await client.connect();
        this.connections.set(userId, { client, lastUsed: Date.now() });
        logger_1.logger.info('IMAP connected', { userId, host });
        return client;
    }
    async disconnect(userId) {
        const entry = this.connections.get(userId);
        if (entry) {
            await entry.client.logout().catch(() => { });
            this.connections.delete(userId);
        }
    }
    getClient(userId) {
        const entry = this.connections.get(userId);
        if (!entry)
            throw new Error('IMAP not connected');
        entry.lastUsed = Date.now();
        return entry.client;
    }
    async listFolders(userId) {
        const client = this.getClient(userId);
        const folders = [];
        const list = await client.list();
        for (const item of list) {
            const mailbox = await client.status(item.path, { messages: true, unseen: true }).catch(() => null);
            folders.push({
                name: item.name,
                path: item.path,
                delimiter: item.delimiter || '/',
                total: mailbox?.messages || 0,
                unread: mailbox?.unseen || 0,
                specialUse: item.specialUse,
            });
        }
        return folders;
    }
    async listEmails(userId, folder, options = {}) {
        const client = this.getClient(userId);
        const lock = await client.getMailboxLock(folder);
        try {
            const mailbox = client.mailbox;
            const total = mailbox?.exists || 0;
            const pageSize = options.pageSize || 50;
            const page = options.page || 1;
            const start = total - (page * pageSize) + 1;
            const end = total - ((page - 1) * pageSize);
            if (start > total || start < 1) {
                return { emails: [], total };
            }
            const emails = [];
            const range = `${Math.max(1, start)}:${end}`;
            for await (const message of client.fetch(range, {
                uid: true,
                envelope: true,
                flags: true,
                bodyStructure: true,
            })) {
                const msg = message;
                const envelope = msg.envelope;
                if (!envelope)
                    continue;
                const isRead = msg.flags?.has('\\Seen') || false;
                const isFlagged = msg.flags?.has('\\Flagged') || false;
                const hasAttachments = this.checkHasAttachments(msg.bodyStructure);
                emails.push({
                    uid: msg.uid,
                    messageId: envelope.messageId || '',
                    subject: envelope.subject || '(no subject)',
                    from: (envelope.from || []).map((a) => ({ name: a.name || '', address: a.address || '' })),
                    to: (envelope.to || []).map((a) => ({ name: a.name || '', address: a.address || '' })),
                    cc: (envelope.cc || []).map((a) => ({ name: a.name || '', address: a.address || '' })),
                    date: envelope.date?.toISOString() || new Date().toISOString(),
                    preview: '',
                    isRead,
                    isFlagged,
                    hasAttachments,
                });
            }
            emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return { emails, total };
        }
        finally {
            lock.release();
        }
    }
    async getEmail(userId, folder, uid) {
        const client = this.getClient(userId);
        const lock = await client.getMailboxLock(folder);
        try {
            const message = await client.fetchOne(uid, { source: true, uid: true, envelope: true, flags: true }, { uid: true });
            const msg = message;
            if (!msg?.source)
                throw new Error('Email not found');
            const parsed = await (0, mailparser_1.simpleParser)(msg.source);
            const htmlBody = parsed.html ? (0, sanitize_html_1.default)(parsed.html, {
                allowedTags: sanitize_html_1.default.defaults.allowedTags.concat(['img', 'style']),
                allowedAttributes: { ...sanitize_html_1.default.defaults.allowedAttributes, img: ['src', 'alt', 'width', 'height'], a: ['href', 'target'] },
            }) : '';
            const textBody = parsed.text || '';
            const envelope = msg.envelope;
            return {
                uid: msg.uid,
                messageId: envelope?.messageId || '',
                subject: envelope?.subject || '(no subject)',
                from: (envelope?.from || []).map((a) => ({ name: a.name || '', address: a.address || '' })),
                to: (envelope?.to || []).map((a) => ({ name: a.name || '', address: a.address || '' })),
                cc: (envelope?.cc || []).map((a) => ({ name: a.name || '', address: a.address || '' })),
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
                replyTo: envelope?.replyTo?.map((a) => ({ name: a.name || '', address: a.address || '' })),
                headers: Object.fromEntries(parsed.headers),
            };
        }
        finally {
            lock.release();
        }
    }
    async markAsRead(userId, folder, uid) {
        const client = this.getClient(userId);
        const lock = await client.getMailboxLock(folder);
        try {
            await client.messageFlagsAdd({ uid }, ['\\Seen'], { uid: true });
        }
        finally {
            lock.release();
        }
    }
    async markAsUnread(userId, folder, uid) {
        const client = this.getClient(userId);
        const lock = await client.getMailboxLock(folder);
        try {
            await client.messageFlagsRemove({ uid }, ['\\Seen'], { uid: true });
        }
        finally {
            lock.release();
        }
    }
    async toggleFlag(userId, folder, uid, flagged) {
        const client = this.getClient(userId);
        const lock = await client.getMailboxLock(folder);
        try {
            if (flagged) {
                await client.messageFlagsAdd({ uid }, ['\\Flagged'], { uid: true });
            }
            else {
                await client.messageFlagsRemove({ uid }, ['\\Flagged'], { uid: true });
            }
        }
        finally {
            lock.release();
        }
    }
    async deleteEmail(userId, folder, uid) {
        const client = this.getClient(userId);
        const lock = await client.getMailboxLock(folder);
        try {
            await client.messageFlagsAdd({ uid }, ['\\Deleted'], { uid: true });
            await client.expunge();
        }
        finally {
            lock.release();
        }
    }
    async moveEmail(userId, fromFolder, uid, toFolder) {
        const client = this.getClient(userId);
        const lock = await client.getMailboxLock(fromFolder);
        try {
            await client.messageMove({ uid }, toFolder, { uid: true });
        }
        finally {
            lock.release();
        }
    }
    async appendEmail(userId, folder, rawEmail, flags = []) {
        const client = this.getClient(userId);
        const result = await client.append(folder, rawEmail, flags);
        return result.uid || 0;
    }
    async searchEmails(userId, folder, query) {
        const client = this.getClient(userId);
        const lock = await client.getMailboxLock(folder);
        try {
            const searchCriteria = {};
            if (query.query)
                searchCriteria.text = query.query;
            if (query.from)
                searchCriteria.from = query.from;
            if (query.to)
                searchCriteria.to = query.to;
            if (query.subject)
                searchCriteria.subject = query.subject;
            if (query.since)
                searchCriteria.since = new Date(query.since);
            if (query.before)
                searchCriteria.before = new Date(query.before);
            const uids = await client.search(searchCriteria, { uid: true });
            return Array.isArray(uids) ? uids : [];
        }
        finally {
            lock.release();
        }
    }
    checkHasAttachments(bodyStructure) {
        if (!bodyStructure)
            return false;
        if (bodyStructure.disposition === 'attachment')
            return true;
        if (bodyStructure.childNodes) {
            return bodyStructure.childNodes.some((child) => this.checkHasAttachments(child));
        }
        return false;
    }
}
exports.imapService = new ImapService();
//# sourceMappingURL=imapService.js.map