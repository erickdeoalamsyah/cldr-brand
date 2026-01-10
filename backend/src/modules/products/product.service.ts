
import type { Prisma } from "@prisma/client"
import { prisma } from "../../config/db"
import { createProductSchema, updateProductSchema } from "./product.schemas"
import slugify from "../../utils/slugify"

export class ProductService {
  static async listPublic(query: any) {
    const parsed = listProductsQuerySafe(query)
    const page = parsed.page ?? 1
    const pageSize = parsed.pageSize ?? 10
    const skip = (page - 1) * pageSize

    const where: Prisma.ProductWhereInput = {
      isVisible: true,
    }

    if (parsed.search) {
      where.OR = [
        { name: { contains: parsed.search, mode: "insensitive" } },
        { description: { contains: parsed.search, mode: "insensitive" } },
      ]
    }

    if (parsed.category) {
      // anggap query.category = slug kategori
      where.category = {
        is: {
          slug: parsed.category,
        },
      }
    }

    if (parsed.isPopular !== undefined) {
      where.isPopular = parsed.isPopular
    }

    // filter by size (variant)
    if (parsed.size) {
      where.variants = {
        some: {
          size: parsed.size,
          stock: { gt: 0 },
        },
      }
    }

    // sort
    let orderBy: Prisma.ProductOrderByWithRelationInput = {
      createdAt: "desc",
    }

    if (parsed.sort === "price_asc") {
      orderBy = { price: "asc" }
    } else if (parsed.sort === "price_desc") {
      orderBy = { price: "desc" }
    } else if (parsed.sort === "popular") {
      orderBy = { isPopular: "desc" }
    } else if (parsed.sort === "newest") {
      orderBy = { createdAt: "desc" }
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            orderBy: { position: "asc" },
          },
          variants: {
            orderBy: { size: "asc" },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    const totalPages = Math.ceil(total / pageSize)

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    }
  }

  static async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { position: "asc" },
        },
        variants: {
          orderBy: { size: "asc" },
        },
      },
    })

    if (!product) {
      throw { status: 404, message: "Produk tidak ditemukan." }
    }

    return product
  }

  static async adminList() {
    const items = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { size: "asc" } },
      },
    })

    return items
  }

  static async adminCreate(input: unknown) {
    const parsed = createProductSchema.parse(input)

    const slug = parsed.slug ? parsed.slug : await generateUniqueSlug(parsed.name)

    const product = await prisma.product.create({
      data: {
        name: parsed.name,
        slug,
        description: parsed.description,
        categoryId: parsed.categoryId ?? null,
        isPopular: parsed.isPopular ?? false,
        isVisible: parsed.isVisible ?? true,
        weight: parsed.weight,
        price: parsed.price,
        images: parsed.images
          ? {
              create: parsed.images.map((img, index) => ({
                url: img.url,
                alt: img.alt,
                position: img.position ?? index,
              })),
            }
          : undefined,
        variants: parsed.variants
          ? {
              create: parsed.variants.map((v) => ({
                size: v.size,
                stock: v.stock,
              })),
            }
          : undefined,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: true,
        variants: true,
      },
    })

    return product
  }

  static async adminGet(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { size: "asc" } },
      },
    })

    if (!product) throw { status: 404, message: "Produk tidak ditemukan." }
    return product
  }

  static async adminUpdate(id: number, input: unknown) {
    const parsed = updateProductSchema.parse(input)

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) throw { status: 404, message: "Produk tidak ditemukan." }

    let slug = existing.slug
    if (parsed.name && !parsed.slug) {
      slug = await generateUniqueSlug(parsed.name, existing.id)
    } else if (parsed.slug) {
      slug = parsed.slug
    }

    await prisma.product.update({
      where: { id },
      data: {
        name: parsed.name ?? existing.name,
        slug,
        description: parsed.description ?? existing.description,
        categoryId: parsed.categoryId !== undefined ? parsed.categoryId : existing.categoryId,
        isPopular: parsed.isPopular !== undefined ? parsed.isPopular : existing.isPopular,
        isVisible: parsed.isVisible !== undefined ? parsed.isVisible : existing.isVisible,
        weight: parsed.weight ?? existing.weight,
        price: parsed.price ?? existing.price,
      },
    })

    // replace images jika dikirim
    if (parsed.images) {
      await prisma.productImage.deleteMany({ where: { productId: id } })
      await prisma.productImage.createMany({
        data: parsed.images.map((img, index) => ({
          productId: id,
          url: img.url,
          alt: img.alt,
          position: img.position ?? index,
        })),
      })
    }

    // replace variants jika dikirim
    if (parsed.variants) {
      await prisma.productVariant.deleteMany({ where: { productId: id } })
      await prisma.productVariant.createMany({
        data: parsed.variants.map((v) => ({
          productId: id,
          size: v.size,
          stock: v.stock,
        })),
      })
    }

    return this.adminGet(id)
  }

  static async adminDelete(id: number) {
    // TODO: cek orderItem dan handle kalau masih dipakai
    await prisma.productImage.deleteMany({ where: { productId: id } })
    await prisma.productVariant.deleteMany({ where: { productId: id } })
    await prisma.product.delete({ where: { id } })
  }

  static async validateStock(productId: number, size: string, quantity: number) {
    const variant = await prisma.productVariant.findFirst({
      where: { productId, size },
    })

    if (!variant || variant.stock < quantity) {
      throw { status: 400, message: "Stok tidak cukup." }
    }
  }

  static async decreaseStock(productId: number, size: string, quantity: number) {
    await this.validateStock(productId, size, quantity)

    await prisma.productVariant.updateMany({
      where: { productId, size },
      data: { stock: { decrement: quantity } },
    })
  }

  static async increaseStock(productId: number, size: string, quantity: number) {
    await prisma.productVariant.updateMany({
      where: { productId, size },
      data: { stock: { increment: quantity } },
    })
  }
}

// helper parse query
function listProductsQuerySafe(query: any) {
  const page = query.page ? Number.parseInt(String(query.page), 10) : undefined
  const pageSize = query.pageSize ? Number.parseInt(String(query.pageSize), 10) : undefined

  const sortOptions = ["newest", "price_asc", "price_desc", "popular"] as const
  const sort = sortOptions.includes(query.sort) ? (query.sort as (typeof sortOptions)[number]) : undefined

  return {
    page,
    pageSize,
    search: query.search as string | undefined,
    category: query.category as string | undefined, // slug
    size: query.size as string | undefined,
    isPopular: query.isPopular === "true" ? true : query.isPopular === "false" ? false : undefined,
    sort,
  }
}

async function generateUniqueSlug(name: string, ignoreId?: number) {
  const base = slugify(name)
  let slug = base
  let counter = 1

  while (true) {
    const existing = await prisma.product.findFirst({
      where: {
        slug,
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    })

    if (!existing) break
    slug = `${base}-${counter++}`
  }

  return slug
}
