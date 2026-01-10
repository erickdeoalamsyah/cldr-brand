import { prisma } from "../../config/db"

const allowedOrderStatus = ["AWAITING_PAYMENT", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"] as const
type AllowedOrderStatus = (typeof allowedOrderStatus)[number]

export class OrdersService {
 static async listUserOrders(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      orderNumber: true,
      totalAmount: true,
      paymentStatus: true,
      orderStatus: true,
      shippingTrackingNumber: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          productName: true,
          productSlug: true,
          size: true,
          quantity: true,
          unitPrice: true,
          imageUrl: true,
        },
      },
    },
  })
}


  static async getUserOrderDetail(userId: number, orderNumber: string) {
    const order = await prisma.order.findFirst({
      where: { userId, orderNumber },
      include: { items: true },
    })
    if (!order) throw { status: 404, message: "Order tidak ditemukan." }
    return order
  }

  static async adminUpdateTracking(orderNumber: string, trackingNumber: string) {
    const order = await prisma.order.findUnique({ where: { orderNumber } })
    if (!order) throw { status: 404, message: "Order tidak ditemukan." }

    if (order.paymentStatus !== "PAID") {
      throw { status: 400, message: "Order belum dibayar." }
    }

    return prisma.order.update({
      where: { orderNumber },
      data: {
        shippingTrackingNumber: trackingNumber,
        shippedAt: trackingNumber && !order.shippedAt ? new Date() : order.shippedAt,
        orderStatus: trackingNumber && order.orderStatus === "PACKED" ? "SHIPPED" : order.orderStatus,
      },
    })
  }

  static async adminUpdateStatus(orderNumber: string, status: AllowedOrderStatus) {
    if (!allowedOrderStatus.includes(status)) throw { status: 400, message: "Status tidak valid." }

    const order = await prisma.order.findUnique({ where: { orderNumber } })
    if (!order) throw { status: 404, message: "Order tidak ditemukan." }

    if (order.paymentStatus !== "PAID" && !["CANCELLED", "AWAITING_PAYMENT"].includes(status)) {
      throw { status: 400, message: "Hanya order yang sudah PAID yang bisa diproses (PACKED/SHIPPED/DELIVERED)." }
    }

    const updateData: any = { orderStatus: status }

    if (status === "PACKED" && !order.packedAt) updateData.packedAt = new Date()
    if (status === "SHIPPED" && !order.shippedAt) updateData.shippedAt = new Date()
    if (status === "DELIVERED" && !order.deliveredAt) updateData.deliveredAt = new Date()
    if (status === "CANCELLED" && !order.cancelledAt) updateData.cancelledAt = new Date()

    return prisma.order.update({
      where: { orderNumber },
      data: updateData,
    })
  }

  static async listAllOrders() {
    return prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: true,
      },
    })
  }
  static async adminListOrders() {
    return prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        orderNumber: true,
        createdAt: true,
        totalAmount: true,
        paymentStatus: true,
        orderStatus: true,
        shippingTrackingNumber: true,

        // snapshot shipping (ini yang admin butuh)
        shippingName: true,
        shippingPhone: true,
        shippingAddress: true,
        shippingProvinceName: true,
        shippingCityName: true,
        shippingSubdistrictName: true,
        shippingPostalCode: true,
        shippingCourier: true,
        shippingService: true,
        shippingEtd: true,
        shippingCost: true,

        user: {
          select: { name: true, email: true },
        },

        // ringkas: jumlah item (admin biasanya butuh quick glance)
        items: {
          select: { id: true }, // cukup untuk count di FE
        },
      },
    });
  }

  // ✅ untuk detail admin: items lengkap + alamat lengkap
  static async adminGetOrderDetail(orderNumber: string) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: {
          select: { name: true, email: true },
        },
        items: {
          select: {
            id: true,
            productName: true,
            productSlug: true,
            size: true,
            quantity: true,
            unitPrice: true,
            imageUrl: true,
            subtotal: true,
          },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!order) throw { status: 404, message: "Order tidak ditemukan." };
    return order;
  }
}
