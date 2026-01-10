import jwt from "jsonwebtoken";
import { env } from "../config/env";
import crypto from "crypto";

export function signJwt(payload: object): string {
  return jwt.sign(
    payload, 
    env.JWT_SECRET,
    { 
      expiresIn: '1d'
    } 
  );
}

export function verifyJwt<T = any>(token: string): T {
  return jwt.verify(token, env.JWT_SECRET) as T;
}

export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
