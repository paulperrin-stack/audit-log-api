import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AuditLogService, CreateLogData } from '../services/audit-log.service.js';
import { Role } from '../types/prisma.js';

const authService = new AuthService();
const auditLogService = new AuditLogService();

function baseAuthLog(req: Request): Pick<CreateLogData, 'actorEmail' | 'actorRole' | 'ipAddress' | 'userAgent' | 'resourceType'> {
    return {
        actorEmail: req.body.email,
        actorRole: Role.VIEWER, // default for unauthenticated requests — not actual role
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        resourceType: 'User',
    };
}

export class AuthController {
    // POST /auth/register
    static async register(req: Request, res: Response): Promise<void> {
        try {
        const { email, password } = req.body;

        const result = await authService.registerUser(email, password);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result,
        });

        auditLogService.createLog({
            ...baseAuthLog(req),
            actorId: result.id,
            action: 'user.registered',
            resourceId: result.id,
            statusCode: 201,
            success: true,
        }).catch((err) => console.error('[AuthController.register] audit log failed:', err));

        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('already exists')) {
                    res.status(409).json({ success: false, message: error.message });
                } else if (error.message.includes('Invalid') || error.message.includes('required')) {
                    res.status(400).json({ success: false, message: error.message });
                } else {
                    console.error('[AuthController.register]', error);
                    res.status(500).json({ success: false, message: 'Internal server error' });
                }
            }

            const statusCode = res.headersSent ? res.statusCode : 500;
            auditLogService.createLog({
                ...baseAuthLog(req),
                action: 'user.registered',
                statusCode,
                success: false,
            }).catch((err) => console.error('[AuthController.register] audit log failed:', err));
        }
    }

    // POST /auth/login
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            const result = await authService.loginUser(email, password);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result,
            });

            auditLogService.createLog({
                ...baseAuthLog(req),
                action: 'user.login',
                statusCode: 200,
                success: true,
            }).catch((err) => console.error('[AuthController.login] audit log failed:', err));

        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('Invalid email or password')) {
                    res.status(401).json({ success: false, message: 'Invalid email or password' });
                } else {
                    console.error('[AuthController.login]', error);
                    res.status(500).json({ success: false, message: 'Internal server error' });
                }
            }

            // Log failed login attempts — critical for detecting brute force
            const statusCode = res.headersSent ? res.statusCode : 500;
            auditLogService.createLog({
                ...baseAuthLog(req),
                action: 'user.login',
                statusCode,
                success: false,
            }).catch((err) => console.error('[AuthController.login] audit log failed:', err))
        }
    }
}