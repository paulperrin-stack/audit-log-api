import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../services/audit-log.service.js';
import { AuditLogQuery } from '../validators/audit-log.validator.js';

const auditLogService = new AuditLogService();

export class AuditLogController {
    static async getLogs (req: Request, res: Response): Promise<void> {
        try {
            const query = res.locals.query as AuditLogQuery;
            const result = await auditLogService.getLogs(query);

            res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error) {
            console.error('[AuditLogController.getLogs]', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async getStats(req: Request, res: Response): Promise<void> {
        try {
            const result = await auditLogService.getStats();

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            console.error('[AuditLogController.getStats]', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async getLogById(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params['id'] as string;

            const log = await auditLogService.getLogById(id);

            if (!log) {
                res.status(404).json({ success: false, message: 'Audit log entry not found' });
                return;
            }

            res.status(200).json({
                success: true,
                data: log,
            });
        } catch (error) {
            console.error('[AuditLogController.getLogById]', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}