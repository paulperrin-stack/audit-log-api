import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../services/audit-log.service.js';

const auditLogService = new AuditLogService();

export function auditLog(action: string, resourceType: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
        res.on('finish', () => {
            if (!req.user) return;

            const success = res.statusCode < 400;

            auditLogService.createLog({
                actorId: req.user.id,
                actorEmail: req.user.email,
                actorRole: req.user.role,
                action,
                resourceType,
                resourceId: res.locals.resourceId,
                previousState: res.locals.previousState,
                newState: res.locals.newState,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                statusCode: res.statusCode,
                success,
            }).catch((err) => {
                console.error('[auditLog] Failed to write audit log entry:', err);
            });
        });

        next();
    };
}