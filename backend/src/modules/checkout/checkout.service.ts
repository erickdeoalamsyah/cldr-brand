import { prisma } from "../../config/db"
import { ShippingService } from "../shipping/shipping.service"
import type { CreateOrderInput } from "./checkout.schemas"

type CheckoutSummaryOptions = {
  addressId?: number
  courier?: string
}

export class CheckoutService {
 
  static async getSummary(userId: number, opts: CheckoutSummaryOptions = {}) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { position: "asc" },
                  take: 1,
                },
              },
            },
            variant: true,
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      throw { status: 400, message: "Keranjang kamu masih kosong." }
    }

    // --- Ambil alamat ---
    let address
    if (opts.addressId) {
      address = await prisma.address.findFirst({
        where: {
          id: opts.addressId,
          userId,
        },
      })

      if (!address) {
        throw { status: 404, message: "Alamat tidak ditemukan." }
      }
    } else {
      address = await prisma.address.findFirst({
        where: {
          userId,
          isPrimary: true,
        },
      })

      if (!address) {
        throw {
          status: 400,
          message: "Belum ada alamat utama. Tambahkan dulu alamat pengiriman.",
        }
      }
    }

    // --- Map cart item jadi shape yang enak dipakai FE ---
    const items = cart.items.map((item) => {
      const firstImage = item.product.images[0]

      return {
        productId: item.productId,
        productName: item.product.name,
        productSlug: item.product.slug,
        variantId: item.variantId,
        size: item.variant?.size ?? null,
        quantity: item.quantity,
        price: item.product.price,
        imageUrl: firstImage?.url ?? null,
      }
    })

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    const totalWeightGrams = cart.items.reduce((sum, i) => sum + i.product.weight * i.quantity, 0)

    if (totalWeightGrams <= 0) {
      throw {
        status: 400,
        message: "Berat produk belum diatur dengan benar. Hubungi admin toko.",
      }
    }

    // --- Opsional: hitung ongkir langsung kalau courier dikirim ---
    let shippingEstimate: any = null
    if (opts.courier) {
      shippingEstimate = await ShippingService.estimateShippingCost({
        destinationId: address.subdistrictId,
        weightGrams: totalWeightGrams,
        courier: opts.courier,
      })
    }

    return {
      address,
      items,
      totals: {
        subtotal,
        totalWeightGrams,
      },
      shippingEstimate,
    }
  }


  static async createOrder(userId: number, input: CreateOrderInput) {
    const { addressId, courier, courierService } = input

    // --- Ambil cart fresh ---
const cart = await prisma.cart.findUnique({
  where: { userId },
  include: {
    items: {
      include: {
        product: {
          include: {
            images: {
              orderBy: { position: "asc" },
              take: 1,
            },
          },
        },
        variant: true,
      },
    },
  },
})


    if (!cart || cart.items.length === 0) {
      throw { status: 400, message: "Keranjang kamu masih kosong." }
    }

    // --- Ambil alamat (by addressId / primary) ---
    let address
    if (addressId) {
      address = await prisma.address.findFirst({
        where: { id: addressId, userId },
      })
      if (!address) {
        throw { status: 404, message: "Alamat tidak ditemukan." }
      }
    } else {
      address = await prisma.address.findFirst({
        where: { userId, isPrimary: true },
      })
      if (!address) {
        throw {
          status: 400,
          message: "Belum ada alamat utama. Tambahkan terlebih dahulu alamat pengiriman.",
        }
      }
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

    const totalWeightGrams = cart.items.reduce((sum, item) => sum + item.product.weight * item.quantity, 0)

    if (totalWeightGrams <= 0) {
      throw {
        status: 400,
        message: "Berat produk belum diatur dengan benar. Hubungi admin toko.",
      }
    }


    const estimate: any = await ShippingService.estimateShippingCost({
      destinationId: address.subdistrictId,
      weightGrams: totalWeightGrams,
      courier,
    })

    // ✅ support 2 bentuk: array langsung ATAU { services: [] }
    const services = Array.isArray(estimate) ? estimate : Array.isArray(estimate?.services) ? estimate.services : []

    if (services.length === 0) {
      throw { status: 500, message: "Gagal mendapatkan data ongkir dari RajaOngkir." }
    }

    const selected = services.find((s: any) => s.service === courierService)

    if (!selected) {
      throw {
        status: 400,
        message: "Layanan kurir yang dipilih tidak valid.",
      }
    }

    const shippingCost = Number(selected.cost)
    const shippingEtd = selected.etd as string | undefined

    const totalAmount = subtotal + shippingCost

    // --- Transaksi: bikin Order + OrderItem ---
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Saran: Tambahkan pengecekan stok di sini sebelum membuat order
      // agar user tidak bisa checkout jika stok 0
      for (const item of cart.items) {
        if (!item.variantId) {
          throw {
            status: 400,
            message: `Varian produk tidak valid untuk checkout.`,
          }
        }

        const productVariant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        })

        if (!productVariant || productVariant.stock < item.quantity) {
          throw {
            status: 400,
            message: `Stok produk ${item.product.name} tidak cukup untuk checkout.`,
          }
        }
      }

      // 1) create order dulu dengan orderNumber "TEMP"
      const order = await tx.order.create({
        data: {
          orderNumber: "TEMP", // nanti di-update lebih human-friendly
          userId,
          addressId: address.id,

          shippingName: address.recipientName,
          shippingPhone: address.phone,
          shippingAddress: address.addressLine,
          shippingProvinceId: address.provinceId,
          shippingCityId: address.cityId,
          shippingSubdistrictId: address.subdistrictId,
          shippingPostalCode: address.postalCode ?? "",
          shippingProvinceName: address.provinceName ?? null,
          shippingCityName: address.cityName ?? null,
          shippingSubdistrictName: address.subdistrictName ?? null,

          shippingCourier: courier,
          shippingService: courierService,
          shippingCost,
          shippingEtd: shippingEtd ?? null,

          subtotalAmount: subtotal,
          shippingAmount: shippingCost,
          totalAmount,

          // paymentStatus & orderStatus pakai default dari Prisma:
          // paymentStatus: PENDING
          // orderStatus: AWAITING_PAYMENT
        },
      })

      // 2) snapshot item2 ke OrderItem
      await tx.orderItem.createMany({
  data: cart.items.map((item) => ({
    orderId: order.id,
    productId: item.productId,
    variantId: item.variantId,

    // snapshot produk
    productName: item.product.name,
    productSlug: item.product.slug,
    imageUrl: item.product.images?.[0]?.url ?? null,

    size: item.variant?.size ?? null,
    unitPrice: item.product.price,
    quantity: item.quantity,
    subtotal: item.product.price * item.quantity,
  })),
})


      // 4) Generate orderNumber final (misal: CLRD-2025-00023)
      const now = new Date()
      const year = now.getFullYear()
      const orderNumber = `CLRD-${year}-${String(order.id).padStart(5, "0")}`

      const finalOrder = await tx.order.update({
        where: { id: order.id },
        data: { orderNumber },
        include: {
          items: true,
        },
      })

      return finalOrder
    })

    return createdOrder
  }
}
