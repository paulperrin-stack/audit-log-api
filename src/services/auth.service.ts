import prisma from '../utils/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');

const SALT_ROUNDS = 10;
// Must match SALT_ROUNDS. If SALT_ROUNDS changes, regenerate this hash.
const DUMMY_HASH = '$2b$10$X4kv7j5ZcG39WgogSl16aufxkiYSypPMEAIFq0PxIzZJPnkMxHnHi';

export class AuthService {
    async registerUser(email: string, password: string) {
        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            throw new Error('Email is already registered');
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = await prisma.user.create({
            data: {
                email: normalizedEmail,
                passwordHash: hashedPassword,
            },
        });

        const { passwordHash: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    async loginUser(email: string, password: string) {
        const normalizedEmail = email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (!user) {
            await bcrypt.compare(password, DUMMY_HASH);
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return { token };
    }
}