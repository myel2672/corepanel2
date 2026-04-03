import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error.issues && Array.isArray(error.issues)) {
        res.status(400).json({
          status: 'error',
          message: 'Validation hatası',
          errors: error.issues.map((e: any) => ({
            field: e.path?.join('.') || 'unknown',
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
