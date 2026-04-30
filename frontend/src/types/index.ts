export interface User {
  id: string;
  email: string;
  name: string;
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
