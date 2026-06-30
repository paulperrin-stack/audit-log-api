import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

const router = Router();

/**
 * POST /auth/register
 * Body: { email: string; password: string }
 * Returns 201 on success, 409 on duplicate email
 */
router.post('/register', validateBody(registerSchema), AuthController.register);

/**
 * POST /auth/login
 * Body: { email: string; password: string }
 * Returns 200 + JWT on success, 401 on bad credentials
 */
router.post('/login', validateBody(loginSchema), AuthController.login);

export default router;