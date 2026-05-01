import { MailcowDomain, MailcowMailbox } from '../types';
declare class MailcowApiService {
    private client;
    constructor();
    getDomains(): Promise<MailcowDomain[]>;
    getMailboxes(domain?: string): Promise<MailcowMailbox[]>;
    createMailbox(data: {
        local_part: string;
        domain: string;
        password: string;
        name?: string;
        quota?: number;
    }): Promise<any>;
    getAliases(): Promise<any[]>;
    getDomainAdmins(): Promise<any[]>;
    getQuarantine(): Promise<any[]>;
    isDomainAdmin(email: string): Promise<boolean>;
}
export declare const mailcowApiService: MailcowApiService;
export {};
//# sourceMappingURL=mailcowApiService.d.ts.map