import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export function validateBody(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      const fieldErrors = Object.values(flattened.fieldErrors)
        .flat()
        .filter(Boolean) as string[];
      const formErrors = flattened.formErrors;

      const firstMessage =
        fieldErrors[0] ||
        formErrors[0] ||
        "Input tidak valid. Mohon periksa kembali data Anda.";

      return res.status(400).json({
        success: false,
        message: firstMessage, 
        errors: flattened, 
      });
    }

    req.body = parsed.data;
    next();
  };
}
