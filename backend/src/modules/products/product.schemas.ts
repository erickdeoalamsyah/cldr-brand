import { z } from "zod";

export const productImageInputSchema = z.object({
  url: z.string().url("URL gambar tidak valid."),
  alt: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

export const productVariantInputSchema = z.object({
  size: z.string().min(1, "Size wajib diisi."),
  stock: z.number().int().min(0, "Stok tidak boleh negatif."),
});

export const createProductSchema = z.object({
  name: z.string().min(2, "Nama produk minimal 2 karakter."),
  slug: z.string().optional(), // kita bisa generate dari name kalau kosong
  description: z.string().optional(),
  categoryId: z.number().optional(),
  isPopular: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  weight: z.number().int().min(1, "Berat produk minimal 1 gram."),
  price: z.number().int().min(0, "Harga tidak boleh negatif."),

  images: z.array(productImageInputSchema).optional(),
  variants: z.array(productVariantInputSchema).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductsQuerySchema = z.object({
  page: z
    .string()
    .transform((v) => parseInt(v, 10))
    .optional()
    .catch(undefined),
  pageSize: z
    .string()
    .transform((v) => parseInt(v, 10))
    .optional()
    .catch(undefined),
  search: z.string().optional(),
  category: z.string().optional(),
  size: z.string().optional(),
  isPopular: z
    .string()
    .transform((v) => v === "true")
    .optional()
    .catch(undefined),
  sort: z
    .enum(["newest", "price_asc", "price_desc", "popular"])
    .optional(),
});
