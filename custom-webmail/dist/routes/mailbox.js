"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const imapService_1 = require("../services/imapService");
const smtpService_1 = require("../services/smtpService");
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
// Get folders
router.get('/folders', async (req, res) => {
    try {
        const folders = await imapService_1.imapService.listFolders(req.user.email);
        res.json({ folders });
    }
    catch (err) {
        logger_1.logger.error('Failed to list folders', { error: err.message });
        res.status(500).json({ error: 'Failed to list folders' });
    }
});
// List emails in folder
router.get('/emails/:folder', async (req, res) => {
    try {
        const { folder } = req.params;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 50;
        const result = await imapService_1.imapService.listEmails(req.user.email, decodeURIComponent(folder), { page, pageSize });
        res.json(result);
    }
    catch (err) {
        logger_1.logger.error('Failed to list emails', { error: err.message });
        res.status(500).json({ error: 'Failed to list emails' });
    }
});
// Get single email
router.get('/email/:folder/:uid', async (req, res) => {
    try {
        const { folder, uid } = req.params;
        const email = await imapService_1.imapService.getEmail(req.user.email, decodeURIComponent(folder), parseInt(uid));
        res.json({ email });
    }
    catch (err) {
        logger_1.logger.error('Failed to get email', { error: err.message });
        res.status(500).json({ error: 'Failed to get email' });
    }
});
// Mark as read
router.post('/email/:folder/:uid/read', async (req, res) => {
    try {
        const { folder, uid } = req.params;
        await imapService_1.imapService.markAsRead(req.user.email, decodeURIComponent(folder), parseInt(uid));
        res.json({ success: true });
    }
    catch (err) {
        logger_1.logger.error('Failed to mark as read', { error: err.message });
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});
// Mark as unread
router.post('/email/:folder/:uid/unread', async (req, res) => {
    try {
        const { folder, uid } = req.params;
        await imapService_1.imapService.markAsUnread(req.user.email, decodeURIComponent(folder), parseInt(uid));
        res.json({ success: true });
    }
    catch (err) {
        logger_1.logger.error('Failed to mark as unread', { error: err.message });
        res.status(500).json({ error: 'Failed to mark as unread' });
    }
});
// Toggle flag
router.post('/email/:folder/:uid/flag', async (req, res) => {
    try {
        const { folder, uid } = req.params;
        const { flagged } = req.body;
        await imapService_1.imapService.toggleFlag(req.user.email, decodeURIComponent(folder), parseInt(uid), flagged);
        res.json({ success: true });
    }
    catch (err) {
        logger_1.logger.error('Failed to toggle flag', { error: err.message });
        res.status(500).json({ error: 'Failed to toggle flag' });
    }
});
// Delete email
router.delete('/email/:folder/:uid', async (req, res) => {
    try {
        const { folder, uid } = req.params;
        await imapService_1.imapService.deleteEmail(req.user.email, decodeURIComponent(folder), parseInt(uid));
        res.json({ success: true });
    }
    catch (err) {
        logger_1.logger.error('Failed to delete email', { error: err.message });
        res.status(500).json({ error: 'Failed to delete email' });
    }
});
// Move email
router.post('/email/:folder/:uid/move', async (req, res) => {
    try {
        const { folder, uid } = req.params;
        const { toFolder } = req.body;
        await imapService_1.imapService.moveEmail(req.user.email, decodeURIComponent(folder), parseInt(uid), toFolder);
        res.json({ success: true });
    }
    catch (err) {
        logger_1.logger.error('Failed to move email', { error: err.message });
        res.status(500).json({ error: 'Failed to move email' });
    }
});
// Search emails
router.get('/search/:folder', async (req, res) => {
    try {
        const { folder } = req.params;
        const { query, from, to, subject, since, before } = req.query;
        const uids = await imapService_1.imapService.searchEmails(req.user.email, decodeURIComponent(folder), {
            query: query,
            from: from,
            to: to,
            subject: subject,
            since: since,
            before: before,
        });
        res.json({ uids });
    }
    catch (err) {
        logger_1.logger.error('Failed to search emails', { error: err.message });
        res.status(500).json({ error: 'Failed to search emails' });
    }
});
// Send email
router.post('/send', async (req, res) => {
    try {
        const { to, cc, bcc, subject, htmlBody, textBody, attachments, inReplyTo, references } = req.body;
        await smtpService_1.smtpService.sendEmail(config_1.config.smtp.host, config_1.config.smtp.port, req.user.email, req.body.password || '', config_1.config.smtp.tls, {
            to: to,
            cc: cc,
            bcc: bcc,
            subject,
            htmlBody,
            textBody,
            attachments,
            inReplyTo,
            references,
        });
        // Save to Sent folder via IMAP
        const mimeMessage = smtpService_1.smtpService.buildMimeMessage(req.user.email, {
            to: to,
            cc: cc,
            subject,
            htmlBody,
            textBody,
            attachments,
        });
        try {
            await imapService_1.imapService.appendEmail(req.user.email, 'Sent', mimeMessage, ['\\Seen']);
        }
        catch (err) {
            logger_1.logger.warn('Failed to save to Sent folder', { error: err.message });
        }
        res.json({ success: true });
    }
    catch (err) {
        logger_1.logger.error('Failed to send email', { error: err.message });
        res.status(500).json({ error: 'Failed to send email' });
    }
});
// Save draft
router.post('/draft', async (req, res) => {
    try {
        const { to, cc, bcc, subject, htmlBody, textBody, draftUid } = req.body;
        const mimeMessage = smtpService_1.smtpService.buildMimeMessage(req.user.email, {
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
                await imapService_1.imapService.deleteEmail(req.user.email, 'Drafts', draftUid);
            }
            catch { }
        }
        const uid = await imapService_1.imapService.appendEmail(req.user.email, 'Drafts', mimeMessage, ['\\Draft', '\\Seen']);
        res.json({ success: true, uid });
    }
    catch (err) {
        logger_1.logger.error('Failed to save draft', { error: err.message });
        res.status(500).json({ error: 'Failed to save draft' });
    }
});
exports.default = router;
//# sourceMappingURL=mailbox.js.map