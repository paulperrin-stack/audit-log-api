import { Router } from 'express';
import { AuditLogController } from '../controllers/audit-log.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { validateQuery } from '../middleware/validate.middleware.js';
import { auditLogQuerySchema } from '../validators/audit-log.validator.js';
import { Role } from '../types/prisma.js';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN, Role.AUDITOR));

router.get('/', validateQuery(auditLogQuerySchema), AuditLogController.getLogs);

router.get('/stats', AuditLogController.getStats);

router.get('/:id', AuditLogController.getLogById);

export default router;