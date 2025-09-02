import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';

export function validate(schema: ZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}
