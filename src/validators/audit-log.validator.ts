import { z } from 'zod';

export const auditLogQuerySchema = z.object({
    query: z.object({
        action:         z.string().optional(),
        actorId:        z.string().optional(),
        resourceType:   z.string().optional(),
        success: z
            .enum(['true', 'false'])
            .transform((val) => val === 'true')
            .optional(),
        page:           z.coerce.number().int().positive().default(1),
        limit:          z.coerce.number().int().positive().max(100).default(20),
    }),
});

export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>['query'];