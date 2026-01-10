import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("4000"),

  DATABASE_URL: z.string().url(),

  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default("1d"),

  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM_NAME: z.string(),
  SMTP_FROM_EMAIL: z.string().email(),
  
  CLOUDINARY_CLOUD_NAME: z.string(),  
  CLOUDINARY_API_KEY: z.string(),     
  CLOUDINARY_API_SECRET: z.string(),   
  CLOUDINARY_FOLDER: z.string().optional(),

  MIDTRANS_SERVER_KEY: z.string().optional(),
  MIDTRANS_CLIENT_KEY: z.string().optional(),
  MIDTRANS_IS_PRODUCTION: z.string().optional(),
  APP_FRONTEND_URL: z.string().default("http://localhost:3000"),
  BACKEND_BASE_URL: z.string().default("http://localhost:4000"),

  RAJAONGKIR_API_KEY: z.string().min(10, "RajaOngkir API key wajib diisi"),
  RAJAONGKIR_BASE_URL: z
    .string()
    .default("https://rajaongkir.komerce.id/api/v1"),
  RAJAONGKIR_ORIGIN_ID: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
