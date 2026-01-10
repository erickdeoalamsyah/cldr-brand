// src/modules/checkout/checkout.schemas.ts
import { z } from "zod";

export const createOrderSchema = z.object({
  // optional: kalau nggak dikirim pakai alamat utama (isPrimary = true)
  addressId: z.number().int().optional(),

  // jne, jnt, etc – nanti di FE kamu bisa kirim string kecil
  courier: z.string().min(2, "Kurir wajib diisi."),

  // contoh: REG, YES, CTC, dsb – harus cocok sama 'service' dari RajaOngkir
  courierService: z
    .string()
    .min(1, "Layanan kurir wajib diisi."),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
