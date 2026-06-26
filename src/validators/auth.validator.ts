import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        email: z
            .string({ error: 'Email is required' })
            .email('Invalid email format'),
        password: z
            .string({ error: 'Password is required' })
            .min(8, 'Password must be at least 8 characters long'),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z
            .string({ error: 'Email is required' })
            .email('Invalid email format'),
        password: z
            .string({ error: 'Password is required' }),
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;