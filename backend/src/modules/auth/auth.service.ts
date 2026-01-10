import { prisma } from "../../config/db";
import { hashPassword, comparePassword } from "../../utils/password";
import { generateRandomToken, signJwt } from "../../utils/token";
import { sendMail } from "../../config/mailer";

const FRONTEND_BASE_URL = "http://localhost:3000"; // nanti ambil dari env

type UserRole = "USER" | "ADMIN";

export class AuthService {
  static async register(name: string, email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw { status: 400, message: "Email already registered" };
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "USER",
      },
    });

    await this.sendVerificationEmail(user.id, user.email);

    return user;
  }

  static async sendVerificationEmail(userId: number, email: string) {
    const token = generateRandomToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 jam

    await prisma.emailVerificationToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    const verifyUrl = `${FRONTEND_BASE_URL}/auth/verify-email?token=${token}`;

    const html = `
      <p>Hi,</p>
      <p>Silakan klik link berikut untuk verifikasi email Anda:</p>
      <p><a href="${verifyUrl}">Verifikasi Email</a></p>
      <p>Link ini hanya berlaku selama 1 jam.</p>
    `;

    await sendMail({
      to: email,
      subject: "Verifikasi Email CLRD Store",
      html,
    });
  }

  static async verifyEmail(token: string) {
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw { status: 400, message: "Token verifikasi tidak valid atau kadaluarsa" };
    }

    const user = await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    });

    await prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    const jwt = signJwt({ id: user.id, role: user.role });

    return { user, token: jwt };
  }

  static async resendVerification(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // jangan bocorin bahwa email tidak terdaftar → tetap 200
      return;
    }

    if (user.emailVerifiedAt) {
      return;
    }

    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    await this.sendVerificationEmail(user.id, user.email);
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw { status: 400, message: "Email atau password salah" };
    }

    const match = await comparePassword(password, user.passwordHash);
    if (!match) {
      throw { status: 400, message: "Email atau password salah" };
    }

    if (!user.emailVerifiedAt) {
      throw { status: 403, message: "Email belum terverifikasi" };
    }

    const token = signJwt({ id: user.id, role: user.role });

    return { user, token };
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // tidak bocorin, tetap 200
      return;
    }

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const token = generateRandomToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 menit

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const resetUrl = `${FRONTEND_BASE_URL}/auth/reset-password?token=${token}`;

    const html = `
      <p>Hi,</p>
      <p>Anda menerima email ini karena ada permintaan reset password.</p>
      <p>Silakan klik link berikut untuk mengatur password baru:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p>
    `;

    await sendMail({
      to: email,
      subject: "Reset Password CLRD Store",
      html,
    });
  }

  static async resetPassword(token: string, newPassword: string) {
    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw { status: 400, message: "Token reset password tidak valid atau kadaluarsa" };
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });

    await prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
  }
}
