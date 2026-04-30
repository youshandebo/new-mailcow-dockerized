import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { imapService } from '../services/imapService';
import { smtpService } from '../services/smtpService';
import { config } from '../config';
import { logger } from '../utils/logger';
import { EmailAddress } from '../types';

const router = Router();

// Get folders
router.get('/folders', async (req: AuthRequest, res: Response) => {
  try {
    const folders = await imapService.listFolders(req.user!.email);
    res.json({ folders });
  } catch (err: any) {
    logger.error('Failed to list folders', { error: err.message });
    res.status(500).json({ error: 'Failed to list folders' });
  }
});

// List emails in folder
router.get('/emails/:folder', async (req: AuthRequest, res: Response) => {
  try {
    const { folder } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;

    const result = await imapService.listEmails(req.user!.email, decodeURIComponent(folder), { page, pageSize });
    res.json(result);
  } catch (err: any) {
    logger.error('Failed to list emails', { error: err.message });
    res.status(500).json({ error: 'Failed to list emails' });
  }
});

// Get single email
router.get('/email/:folder/:uid', async (req: AuthRequest, res: Response) => {
  try {
    const { folder, uid } = req.params;
    const email = await imapService.getEmail(req.user!.email, decodeURIComponent(folder), parseInt(uid));
    res.json({ email });
  } catch (err: any) {
    logger.error('Failed to get email', { error: err.message });
    res.status(500).json({ error: 'Failed to get email' });
  }
});

// Mark as read
router.post('/email/:folder/:uid/read', async (req: AuthRequest, res: Response) => {
  try {
    const { folder, uid } = req.params;
    await imapService.markAsRead(req.user!.email, decodeURIComponent(folder), parseInt(uid));
    res.json({ success: true });
  } catch (err: any) {
    logger.error('Failed to mark as read', { error: err.message });
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Mark as unread
router.post('/email/:folder/:uid/unread', async (req: AuthRequest, res: Response) => {
  try {
    const { folder, uid } = req.params;
    await imapService.markAsUnread(req.user!.email, decodeURIComponent(folder), parseInt(uid));
    res.json({ success: true });
  } catch (err: any) {
    logger.error('Failed to mark as unread', { error: err.message });
    res.status(500).json({ error: 'Failed to mark as unread' });
  }
});

// Toggle flag
router.post('/email/:folder/:uid/flag', async (req: AuthRequest, res: Response) => {
  try {
    const { folder, uid } = req.params;
    const { flagged } = req.body;
    await imapService.toggleFlag(req.user!.email, decodeURIComponent(folder), parseInt(uid), flagged);
    res.json({ success: true });
  } catch (err: any) {
    logger.error('Failed to toggle flag', { error: err.message });
    res.status(500).json({ error: 'Failed to toggle flag' });
  }
});

// Delete email
router.delete('/email/:folder/:uid', async (req: AuthRequest, res: Response) => {
  try {
    const { folder, uid } = req.params;
    await imapService.deleteEmail(req.user!.email, decodeURIComponent(folder), parseInt(uid));
    res.json({ success: true });
  } catch (err: any) {
    logger.error('Failed to delete email', { error: err.message });
    res.status(500).json({ error: 'Failed to delete email' });
  }
});

// Move email
router.post('/email/:folder/:uid/move', async (req: AuthRequest, res: Response) => {
  try {
    const { folder, uid } = req.params;
    const { toFolder } = req.body;
    await imapService.moveEmail(req.user!.email, decodeURIComponent(folder), parseInt(uid), toFolder);
    res.json({ success: true });
  } catch (err: any) {
    logger.error('Failed to move email', { error: err.message });
    res.status(500).json({ error: 'Failed to move email' });
  }
});

// Search emails
router.get('/search/:folder', async (req: AuthRequest, res: Response) => {
  try {
    const { folder } = req.params;
    const { query, from, to, subject, since, before } = req.query;

    const uids = await imapService.searchEmails(req.user!.email, decodeURIComponent(folder), {
      query: query as string,
      from: from as string,
      to: to as string,
      subject: subject as string,
      since: since as string,
      before: before as string,
    });

    res.json({ uids });
  } catch (err: any) {
    logger.error('Failed to search emails', { error: err.message });
    res.status(500).json({ error: 'Failed to search emails' });
  }
});

// Send email
router.post('/send', async (req: AuthRequest, res: Response) => {
  try {
    const { to, cc, bcc, subject, htmlBody, textBody, attachments, inReplyTo, references } = req.body;

    await smtpService.sendEmail(
      config.smtp.host, config.smtp.port, req.user!.email, req.body.password || '', config.smtp.tls,
      {
        to: to as EmailAddress[],
        cc: cc as EmailAddress[],
        bcc: bcc as EmailAddress[],
        subject,
        htmlBody,
        textBody,
        attachments,
        inReplyTo,
        references,
      }
    );

    // Save to Sent folder via IMAP
    const mimeMessage = smtpService.buildMimeMessage(req.user!.email, {
      to: to as EmailAddress[],
      cc: cc as EmailAddress[],
      subject,
      htmlBody,
      textBody,
      attachments,
    });

    try {
      await imapService.appendEmail(req.user!.email, 'Sent', mimeMessage, ['\\Seen']);
    } catch (err: any) {
      logger.warn('Failed to save to Sent folder', { error: err.message });
    }

    res.json({ success: true });
  } catch (err: any) {
    logger.error('Failed to send email', { error: err.message });
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Save draft
router.post('/draft', async (req: AuthRequest, res: Response) => {
  try {
    const { to, cc, bcc, subject, htmlBody, textBody, draftUid } = req.body;

    const mimeMessage = smtpService.buildMimeMessage(req.user!.email, {
      to: to || [],
      cc: cc || [],
      bcc: bcc || [],
      subject: subject || '(No subject)',
      htmlBody: htmlBody || '',
      textBody: textBody || '',
    });

    // Delete old draft if updating
    if (draftUid) {
      try {
        await imapService.deleteEmail(req.user!.email, 'Drafts', draftUid);
      } catch {}
    }

    const uid = await imapService.appendEmail(req.user!.email, 'Drafts', mimeMessage, ['\\Draft', '\\Seen']);
    res.json({ success: true, uid });
  } catch (err: any) {
    logger.error('Failed to save draft', { error: err.message });
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

export default router;
