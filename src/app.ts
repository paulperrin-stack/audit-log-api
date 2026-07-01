import express, { Request, Response } from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';
import { authenticate } from './middleware/auth.middleware.js';
import { authorize } from './middleware/rbac.middleware.js';
import { Role } from './types/prisma.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);

app.get('/protected', authenticate, authorize(Role.ADMIN), (req, res) => {
    res.json({ message: 'you are an admin', user: req.user });
});

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

export default app;