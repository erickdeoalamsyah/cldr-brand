import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { created, ok } from "../../utils/response";
import { AuthRequest } from "../../middlewares/auth.middleware";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const user = await AuthService.register(name, email, password);
      // tidak kirim passwordHash
      return created(res, { id: user.id, name: user.name, email: user.email }, "User registered, please verify email");
    } catch (err) {
      next(err);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.query.token as string;
      if (!token) {
        throw { status: 400, message: "Token tidak ditemukan" };
      }

      const result = await AuthService.verifyEmail(token);
      return ok(
        res,
        {
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
          },
          token: result.token,
        },
        "Email verified"
      );
    } catch (err) {
      next(err);
    }
  }

  static async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await AuthService.resendVerification(email);
      return ok(res, null, "Jika email terdaftar dan belum terverifikasi, link verifikasi telah dikirim ulang");
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      return ok(
        res,
        {
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
          },
          token: result.token,
        },
        "Login berhasil"
      );
    } catch (err) {
      next(err);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);
      return ok(res, null, "Jika email terdaftar, link reset password telah dikirim");
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      await AuthService.resetPassword(token, password);
      return ok(res, null, "Password berhasil diubah");
    } catch (err) {
      next(err);
    }
  }

}

  

