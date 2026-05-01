import { ImapFlow } from 'imapflow';
import { Folder, Email, EmailDetail, ListOptions, SearchQuery } from '../types';
declare class ImapService {
    private connections;
    private readonly IDLE_TIMEOUT;
    constructor();
    private cleanupIdleConnections;
    connect(userId: string, host: string, port: number, user: string, password: string, tls: boolean): Promise<ImapFlow>;
    disconnect(userId: string): Promise<void>;
    private getClient;
    listFolders(userId: string): Promise<Folder[]>;
    listEmails(userId: string, folder: string, options?: ListOptions): Promise<{
        emails: Email[];
        total: number;
    }>;
    getEmail(userId: string, folder: string, uid: number): Promise<EmailDetail>;
    markAsRead(userId: string, folder: string, uid: number): Promise<void>;
    markAsUnread(userId: string, folder: string, uid: number): Promise<void>;
    toggleFlag(userId: string, folder: string, uid: number, flagged: boolean): Promise<void>;
    deleteEmail(userId: string, folder: string, uid: number): Promise<void>;
    moveEmail(userId: string, fromFolder: string, uid: number, toFolder: string): Promise<void>;
    appendEmail(userId: string, folder: string, rawEmail: Buffer, flags?: string[]): Promise<number>;
    searchEmails(userId: string, folder: string, query: SearchQuery): Promise<number[]>;
    private checkHasAttachments;
}
export declare const imapService: ImapService;
export {};
//# sourceMappingURL=imapService.d.ts.map