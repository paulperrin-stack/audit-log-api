import express, { Request, Response } from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';
import { authenticate } from './middleware/auth.middleware.js';
import { authorize } from './middleware/rbac.middleware.js';
import { Role } from './types/prisma.js';
import { AuditLogService } from './services/audit-log.service.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);

app.post('/test-log', authenticate, async (req, res) => {
  const auditLogService = new AuditLogService();
  await auditLogService.createLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'test.action',
    resourceType: 'Test',
    resourceId: '123',
    previousState: { value: 'old' },
    newState: { value: 'new' },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    statusCode: 200,
    success: true,
  });
  res.json({ ok: true });
});

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

export default app;