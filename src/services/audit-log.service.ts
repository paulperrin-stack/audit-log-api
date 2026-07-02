import { createHash } from 'node:crypto';
import { Prisma, Role } from '../types/prisma.js';
import prisma from '../utils/prisma.js';
import { AuditLog } from '../generated/prisma/client.js';
import { AuditLogQuery } from '../validators/audit-log.validator.js';

export interface CreateLogData {
    actorId?: string;
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
        data.actorId ?? '',
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
                actorId: data.actorId ?? 'anonymous',
                actorEmail: data.actorEmail,
                actorRole: data.actorRole,
                action: data.action,
                resourceType: data.resourceType,
                resourceId: data.resourceId,
                previousState: data.previousState as Prisma.InputJsonValue | undefined,
                newState: data.newState as Prisma.InputJsonValue | undefined,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                statusCode: data.statusCode,
                success: data.success,
                timestamp,
                checksum,
            },
        });
    }

    async getLogs(query: AuditLogQuery) {
        const { action, actorId, resourceType, success, page, limit } = query;

        const where = {
            ...(action          !== undefined && { action }),
            ...(actorId         !== undefined && { actorId }),
            ...(resourceType    !== undefined && { resourceType }),
            ...(success         !== undefined && { success }),
        };

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { timestamp: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.auditLog.count({ where }),
        ]);

        return {
            data: logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getLogById(id: string) {
        return prisma.auditLog.findUnique({ where: { id } });
    }

    async getStats() {
        const [total, byAction, byRole] = await Promise.all([
            prisma.auditLog.count(),

            prisma.auditLog.groupBy({
                by: ['action'],
                _count: { action: true },
                orderBy: { _count: { action: 'desc' } },
            }),

            prisma.auditLog.groupBy({
                by: ['actorRole'],
                _count: { actorRole: true },
                orderBy: { _count: { actorRole: 'desc' } },
            }),
        ]);

        return {
            total,
            byAction: byAction.map((r) => ({ action: r.action, count: r._count.action })),
            byRole:   byRole.map((r) => ({ role: r.actorRole, count: r._count.actorRole })),
        };
    }
}