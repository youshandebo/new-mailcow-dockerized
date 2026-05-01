"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smtpService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("../utils/logger");
class SmtpService {
    createTransporter(host, port, user, password, tls) {
        return nodemailer_1.default.createTransport({
            host,
            port,
            secure: tls,
            auth: { user, pass: password },
            tls: { rejectUnauthorized: false },
        });
    }
    async sendEmail(host, port, user, password, tls, options) {
        const transporter = this.createTransporter(host, port, user, password, tls);
        const attachments = options.attachments?.map(att => ({
            filename: att.filename,
            content: att.content,
            contentType: att.contentType,
        }));
        await transporter.sendMail({
            from: user,
            to: options.to.map(a => a.name ? `${a.name} <${a.address}>` : a.address).join(', '),
            cc: options.cc?.map(a => a.name ? `${a.name} <${a.address}>` : a.address).join(', '),
            bcc: options.bcc?.map(a => a.name ? `${a.name} <${a.address}>` : a.address).join(', '),
            subject: options.subject,
            html: options.htmlBody,
            text: options.textBody,
            attachments,
            inReplyTo: options.inReplyTo,
            references: options.references,
        });
        logger_1.logger.info('Email sent', { from: user, to: options.to.map(a => a.address) });
    }
    buildMimeMessage(from, options) {
        const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substr(2)}`;
        const lines = [];
        lines.push(`From: ${from}`);
        lines.push(`To: ${options.to.map(a => a.name ? `${a.name} <${a.address}>` : a.address).join(', ')}`);
        if (options.cc?.length)
            lines.push(`Cc: ${options.cc.map(a => a.name ? `${a.name} <${a.address}>` : a.address).join(', ')}`);
        lines.push(`Subject: ${options.subject}`);
        lines.push(`Date: ${new Date().toUTCString()}`);
        lines.push(`MIME-Version: 1.0`);
        if (options.inReplyTo)
            lines.push(`In-Reply-To: ${options.inReplyTo}`);
        if (options.references?.length)
            lines.push(`References: ${options.references.join(' ')}`);
        if (options.attachments?.length) {
            lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
            lines.push('');
            lines.push(`--${boundary}`);
            lines.push(`Content-Type: text/html; charset=utf-8`);
            lines.push('');
            lines.push(options.htmlBody || options.textBody);
            lines.push('');
            for (const att of options.attachments) {
                lines.push(`--${boundary}`);
                lines.push(`Content-Type: ${att.contentType}; name="${att.filename}"`);
                lines.push(`Content-Disposition: attachment; filename="${att.filename}"`);
                lines.push(`Content-Transfer-Encoding: base64`);
                lines.push('');
                lines.push(att.content.toString('base64'));
                lines.push('');
            }
            lines.push(`--${boundary}--`);
        }
        else {
            lines.push(`Content-Type: text/html; charset=utf-8`);
            lines.push('');
            lines.push(options.htmlBody || options.textBody);
        }
        return Buffer.from(lines.join('\r\n'));
    }
}
exports.smtpService = new SmtpService();
//# sourceMappingURL=smtpService.js.map