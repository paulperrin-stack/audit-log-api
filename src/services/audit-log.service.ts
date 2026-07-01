import { createHash } from 'node:crypto';
import { Prisma, Role } from '../generated/prisma/client.js';
import prisma from '../utils/prisma.js';

export interface CreateLogData {
    actorId: string;
    actorEmail: string;
    actorRole: Role;
    action: string;
    resourceType: string;
    resourceId?: string;
    previousState?: Record<string, unknown>;
    newState?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    statusCode: number;
    success: boolean;
}

function computeChecksum(data: CreateLogData, timestamp: string): string {
    const content = [
        data.actorId,
        data.actorEmail,
        data.actorRole,
        data.action,
        data.resourceType,
        data.resourceId ?? '',
        data.previousState ? JSON.stringify(data.previousState) : '',
        data.newState ? JSON.stringify(data.newState) : '',
        data.ipAddress ?? '',
        data.userAgent ?? '',
        String(data.statusCode),
        String(data.success),
        timestamp,
    ].join('|');

    return createHash('sha256').update(content).digest('hex');
}

export class AuditLogService {
    async createLog(data: CreateLogData) {
        const timestamp = new Date();
        const timestampISO = timestamp.toISOString();

        const checksum = computeChecksum(data, timestampISO);

        return prisma.auditLog.create({
            data: {
                actorId: data.actorId,
                actorEmail: data.actorEmail,
                actorRole: data.actorRole,
                action: data.action,
                resourceType: data.resourceType,
                resourceId: data.resourceId,
                previousState: data.previousState as Prisma.InputJsonValue ?? null,
                newState: data.newState as Prisma.InputJsonValue ?? null,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                statusCode: data.statusCode,
                success: data.success,
                timestamp,
                checksum,
            },
        });
    }
}