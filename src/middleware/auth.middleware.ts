import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../types/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            message: 'No token provided',
        });
        return;
    }

    const token = authHeader.slice(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: string;
            email: string;
            role: Role;
        };

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
}