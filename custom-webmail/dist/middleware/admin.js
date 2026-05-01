"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = adminMiddleware;
const mailcowApiService_1 = require("../services/mailcowApiService");
const logger_1 = require("../utils/logger");
async function adminMiddleware(req, res, next) {
    if (!req.user?.email) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    try {
        const isAdmin = await mailcowApiService_1.mailcowApiService.isDomainAdmin(req.user.email);
        if (!isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    }
    catch (err) {
        logger_1.logger.error('Admin check failed', { error: err.message });
        return res.status(500).json({ error: 'Failed to verify admin status' });
    }
}
//# sourceMappingURL=admin.js.map