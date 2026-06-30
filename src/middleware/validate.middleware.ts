import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

function formatZodErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const result: Record<string, string[]> = {};

  for (const issue of issues) {
    const [, fieldName] = issue.path;
    const key = fieldName === undefined ? '_root' : String(fieldName);

    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(issue.message);
  }

  return result;
}

export function validateBody<T>(schema: ZodSchema<{ body: T }>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({ body: req.body });

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(result.error.issues),
      });
      return;
    }

    req.body = result.data.body;
    next();
  };
}