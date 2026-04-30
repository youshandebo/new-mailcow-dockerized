import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import { SendOptions, DraftData } from '../types';

class SmtpService {
  private createTransporter(host: string, port: number, user: string, password: string, tls: boolean) {
    return nodemailer.createTransport({
      host,
      port,
      secure: tls,
      auth: { user, pass: password },
      tls: { rejectUnauthorized: false },
    });
  }

  async sendEmail(
    host: string, port: number, user: string, password: string, tls: boolean,
    options: SendOptions
  ): Promise<void> {
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

    logger.info('Email sent', { from: user, to: options.to.map(a => a.address) });
  }

  buildMimeMessage(from: string, options: SendOptions): Buffer {
    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substr(2)}`;
    const lines: string[] = [];

    lines.push(`From: ${from}`);
    lines.push(`To: ${options.to.map(a => a.name ? `${a.name} <${a.address}>` : a.address).join(', ')}`);
    if (options.cc?.length) lines.push(`Cc: ${options.cc.map(a => a.name ? `${a.name} <${a.address}>` : a.address).join(', ')}`);
    lines.push(`Subject: ${options.subject}`);
    lines.push(`Date: ${new Date().toUTCString()}`);
    lines.push(`MIME-Version: 1.0`);
    if (options.inReplyTo) lines.push(`In-Reply-To: ${options.inReplyTo}`);
    if (options.references?.length) lines.push(`References: ${options.references.join(' ')}`);

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
    } else {
      lines.push(`Content-Type: text/html; charset=utf-8`);
      lines.push('');
      lines.push(options.htmlBody || options.textBody);
    }

    return Buffer.from(lines.join('\r\n'));
  }
}

export const smtpService = new SmtpService();
