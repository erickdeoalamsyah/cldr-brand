// src/modules/address/address.schemas.ts
import { z } from "zod";

export const createAddressSchema = z.object({
  label: z.string().max(100).optional().nullable(),

  recipientName: z
    .string()
    .min(2, "Nama penerima minimal 2 karakter.")
    .max(100),

  phone: z
    .string()
    .min(8, "Nomor telepon terlalu pendek.")
    .max(20, "Nomor telepon terlalu panjang."),

  addressLine: z
    .string()
    .min(5, "Detail alamat minimal 5 karakter.")
    .max(255),

  postalCode: z.string().max(10).optional().nullable(),

  provinceId: z.number().int().min(1, "Provinsi wajib diisi."),
  cityId: z.number().int().min(1, "Kota/kabupaten wajib diisi."),
  // kalau kamu nanti tambahin districtId di Prisma, tinggal tambahkan di sini
  subdistrictId: z.number().int().min(1, "Kecamatan/kelurahan wajib diisi."),
  provinceName: z.string().optional().nullable(),
  cityName: z.string().optional().nullable(),
  subdistrictName: z.string().optional().nullable(),
});

export const updateAddressSchema = createAddressSchema.partial();
