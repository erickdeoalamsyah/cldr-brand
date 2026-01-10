import { Response } from "express";

export function ok<T>(res: Response, data: T, message = "OK") {
  return res.status(200).json({ success: true, message, data });
}

export function created<T>(res: Response, data: T, message = "Created") {
  return res.status(201).json({ success: true, message, data });
}

export function badRequest(res: Response, message = "Bad Request") {
  return res.status(400).json({ success: false, message });
}

export function unauthorized(res: Response, message = "Unauthorized") {
  return res.status(401).json({ success: false, message });
}

export function forbidden(res: Response, message = "Forbidden") {
  return res.status(403).json({ success: false, message });
}

export function notFound(res: Response, message = "Not Found") {
  return res.status(404).json({ success: false, message });
}

export function serverError(res: Response, message = "Internal Server Error") {
  return res.status(500).json({ success: false, message });
}
