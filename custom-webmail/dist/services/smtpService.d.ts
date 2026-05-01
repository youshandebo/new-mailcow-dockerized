import { SendOptions } from '../types';
declare class SmtpService {
    private createTransporter;
    sendEmail(host: string, port: number, user: string, password: string, tls: boolean, options: SendOptions): Promise<void>;
    buildMimeMessage(from: string, options: SendOptions): Buffer;
}
export declare const smtpService: SmtpService;
export {};
//# sourceMappingURL=smtpService.d.ts.map