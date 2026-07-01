import { Role } from './prisma.js';

export {};

declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            id: string;
            email: string;
            role: Role;
        };
    }
}