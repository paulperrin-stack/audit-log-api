import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';

const authService = new AuthService();

export class AuthController {
    // POST /auth/register
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            const result = await authService.registerUser(email, password);

            // 201: a new user resource was created
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: result,
            });
        } catch (error) {
            if (error instanceof Error) {
                // Duplicate email — the resource already exists
                if (error.message.includes('already exists')) {
                    res.status(409).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }

                // Validation errors from the service layer
                if (error.message.includes('Invalid') || error.message.includes('required')) {
                    res.status(400).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
            }

            console.error('[AuthController.register]', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    // POST /auth/login
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            const result = await authService.loginUser(email, password);

            // 200: no resource was created, just a token exchanged
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result,
            });
        } catch (error) {
            if (error instanceof Error) {
                // Wrong credentials — intentionally vague to avoid user enumeration
                // // String matches exactly what AuthService throws
                if (error.message.includes('Invalid email or password')) {
                    res.status(401).json({
                        success: false,
                        message: 'Invalid email or password',
                    });
                    return;
                }
            }

            console.error('[AuthController.login]', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }
}