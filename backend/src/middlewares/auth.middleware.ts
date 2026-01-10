import { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/token";
import { unauthorized, forbidden } from "../utils/response";

// definisikan sendiri tipe role sebagai string literal
type UserRole = "USER" | "ADMIN";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: UserRole;
  };
}

export function authRequired(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return unauthorized(res);
  }

  const token = header.substring("Bearer ".length);

  try {
    const payload = verifyJwt<{ id: number; role: UserRole }>(token);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    return unauthorized(res, "Invalid or expired token");
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return unauthorized(res);
  if (req.user.role !== "ADMIN") return forbidden(res, "Admin only");
  next();
}
