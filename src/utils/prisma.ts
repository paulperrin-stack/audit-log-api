import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL as string
});

const prisma = new PrismaClient({ adapter }).$extends({
    query: {
        auditLog: {
            async update() {
                throw new Error("AuditLog records are immutable — 'update' is not permitted");
            },
            async updateMany() {
                throw new Error("AuditLog records are immutable — 'updateMany' is not permitted");
            },
            async delete() {
                throw new Error("AuditLog records are immutable — 'delete' is not permitted");
            },
            async deleteMany() {
                throw new Error("AuditLog records are immutable — 'deleteMany' is not permitted");
            },
            async upsert() {
                throw new Error("AuditLog records are immutable — 'upsert' is not permitted");
            },
        },
    },
});

export default prisma;