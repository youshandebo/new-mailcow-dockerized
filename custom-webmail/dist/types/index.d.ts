export interface User {
    id: string;
    email: string;
    name: string;
}
export interface IMAPCredentials {
    host: string;
    port: number;
    user: string;
    password: string;
    tls: boolean;
}
export interface SMTPCredentials {
    host: string;
    port: number;
    user: string;
    password: string;
    tls: boolean;
}
export interface Folder {
    name: string;
    path: string;
    delimiter: string;
    total: number;
    unread: number;
    specialUse?: string;
}
export interface EmailAddress {
    name?: string;
    address: string;
}
export interface EmailAttachment {
    id: string;
    filename: string;
    contentType: string;
    size: number;
    contentId?: string;
}
export interface Email {
    uid: number;
    messageId: string;
    subject: string;
    from: EmailAddress[];
    to: EmailAddress[];
    cc?: EmailAddress[];
    date: string;
    preview: string;
    isRead: boolean;
    isFlagged: boolean;
    hasAttachments: boolean;
    attachments?: EmailAttachment[];
}
export interface EmailDetail extends Email {
    htmlBody: string;
    textBody: string;
    replyTo?: EmailAddress[];
    headers: Record<string, string>;
}
export interface ListOptions {
    page?: number;
    pageSize?: number;
    sort?: 'date' | 'subject' | 'from';
    order?: 'asc' | 'desc';
}
export interface SearchQuery {
    query: string;
    from?: string;
    to?: string;
    subject?: string;
    since?: string;
    before?: string;
}
export interface SendOptions {
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    subject: string;
    htmlBody: string;
    textBody: string;
    attachments?: Array<{
        filename: string;
        content: Buffer;
        contentType: string;
    }>;
    inReplyTo?: string;
    references?: string[];
}
export interface DraftData {
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    subject: string;
    htmlBody: string;
    textBody: string;
    draftUid?: number;
}
export interface ComposeParams {
    prompt: string;
    context?: string;
    mode: 'compose' | 'reply' | 'improve';
}
export interface EmailContent {
    subject: string;
    body: string;
    from?: EmailAddress[];
}
export interface EmailSummary {
    summary: string;
    category: string;
    importance: 'high' | 'medium' | 'low';
    actionItems: string[];
}
export interface EmailClassification {
    category: string;
    importance: 'high' | 'medium' | 'low';
    labels: string[];
}
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}
export interface AiSettings {
    provider: 'openai' | 'claude';
    apiKey: string;
    model: string;
    baseUrl: string;
    maxTokensCompose: number;
    maxTokensChat: number;
    maxTokensSummarize: number;
    maxTokensClassify: number;
}
export interface MailcowDomain {
    domain_name: string;
    description: string;
    active: number;
    mailboxes: number;
    max_mailboxes: number;
}
export interface MailcowMailbox {
    username: string;
    name: string;
    domain: string;
    active: number;
    quota: number;
    used: number;
}
//# sourceMappingURL=index.d.ts.map