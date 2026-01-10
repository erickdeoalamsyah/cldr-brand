import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter."),
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
});

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
});

export const resendVerificationSchema = z.object({
  email: z.string().email("Format email tidak valid."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid."),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Token reset password tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Nama wajib diisi")
    .max(25, "Nama terlalu panjang"),
});
