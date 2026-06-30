import express, { Request, Response } from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

export default app;