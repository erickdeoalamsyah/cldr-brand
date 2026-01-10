
  import crypto from "crypto"
  import { prisma } from "../../config/db"
  import { midtransSnap } from "./midtrans" 

  type CreateSnapResult = { token: string; redirect_url: string }

  // Minimal subset payload notification yang kita pakai
  type MidtransNotification = {
    order_id: string
    status_code: string
    gross_amount: string // biasanya string dari Midtrans
    signature_key: string
    transaction_status?: string
    transaction_id?: string
    payment_type?: string
    va_numbers?: Array<{ bank?: string; va_number?: string }>
    fraud_status?: string
  }

  function sha512(input: string) {
    return crypto.createHash("sha512").update(input).digest("hex")
  }

  function requireEnv(name: string) {
    const v = process.env[name]
    if (!v) throw new Error(`${name} is required`)
    return v
  }

  function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60_000)
  }

  function buildItemDetails(order: {
    items: Array<{
      productId: number
      variantId: number | null
      productName: string
      size: string | null
      unitPrice: number
      quantity: number
    }>
    shippingAmount: number
    shippingCourier: string
    shippingService: string
  }) {
    const productItems = order.items.map((it) => ({
      id: String(it.productId) + (it.variantId ? `-${it.variantId}` : ""),
      price: it.unitPrice,
      quantity: it.quantity,
      name: it.productName + (it.size ? ` (${it.size})` : ""),
    }))

    // ✅ Midtrans mensyaratkan sum(item_details) == gross_amount
    const shippingItem =
      order.shippingAmount && order.shippingAmount > 0
        ? [
            {
              id: "SHIPPING",
              price: order.shippingAmount,
              quantity: 1,
              name: `Shipping (${String(order.shippingCourier).toUpperCase()} - ${order.shippingService})`,
            },
          ]
        : []

    return [...productItems, ...shippingItem]
  }

  function sumItemDetails(items: Array<{ price: number; quantity: number }>) {
    return items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0)
  }

  export class PaymentsService {
    /**
     * Create Midtrans Snap transaction and return redirect_url.
     * Idempotent: jika order masih PENDING dan sudah ada redirect_url, return itu.
     */
    static async createMidtransRedirectUrl(userId: number, orderNumber: string) {
      const appUrl = requireEnv("APP_FRONTEND_URL")

      const order = await prisma.order.findFirst({
        where: { orderNumber, userId },
        include: { items: true },
      })

      if (!order) throw { status: 404, message: "Order tidak ditemukan." }

      if (order.paymentStatus === "PAID") {
        throw { status: 400, message: "Order sudah dibayar." }
      }

      const midtransOrderId = order.orderNumber.replace("#", "")

      // idempotent: kalau sebelumnya sudah dibuat, pakai ulang
      if (order.midtransRedirectUrl && order.paymentStatus === "PENDING") {
        return {
          orderNumber: order.orderNumber,
          redirectUrl: order.midtransRedirectUrl,
        }
      }

      // Build item_details + validate total
      const item_details = buildItemDetails({
        items: order.items,
        shippingAmount: order.shippingAmount,
        shippingCourier: order.shippingCourier,
        shippingService: order.shippingService,
      })

      const itemsTotal = sumItemDetails(item_details)
      if (itemsTotal !== order.totalAmount) {
        // ini membantu kamu debugging kalau ada mismatch subtotal/shipping/total
        throw {
          status: 500,
          message: `Total mismatch. item_details=${itemsTotal} totalAmount=${order.totalAmount}`,
        }
      }

      // Optional: set expiry (misal 60 menit)
      const expiresAt = addMinutes(new Date(), 60)

      const payload = {
        transaction_details: {
          order_id: midtransOrderId, // using cleaned orderNumber
          gross_amount: order.totalAmount,
        },
        item_details,
        customer_details: {
          first_name: order.shippingName,
          phone: order.shippingPhone,
          shipping_address: {
            first_name: order.shippingName,
            phone: order.shippingPhone,
            address: order.shippingAddress,
            postal_code: order.shippingPostalCode ?? "",
          },
        },
        // Midtrans bisa redirect balik ke finish url
        callbacks: {
          finish: `${appUrl}/public/account?tab=orders&status=success&order=${order.orderNumber}`,
          error: `${appUrl}/public/account?tab=orders&status=error`,
          pending: `${appUrl}/public/account?tab=orders&status=pending`,
        },
      } as any

      let res: CreateSnapResult
      try {
        res = (await midtransSnap.createTransaction(payload)) as CreateSnapResult
      } catch (e: any) {
        // Lempar error yang enak kebaca FE
        const msg = e?.ApiResponse?.error_messages?.join(", ") || e?.message || "Midtrans createTransaction failed"
        throw { status: 502, message: msg }
      }

      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentProvider: "MIDTRANS",
          midtransOrderId: midtransOrderId, // storing cleaned orderId
          midtransRedirectUrl: res.redirect_url,
          midtransSnapToken: res.token,
          paymentExpiresAt: expiresAt,
          // paymentMethod tetap null dulu; nanti dari webhook
        },
      })

      return {
        orderNumber: order.orderNumber,
        redirectUrl: res.redirect_url,
      }
    }

    /**
     * Midtrans webhook notification handler
     * - verify signature
     * - idempotent: if already PAID, ignore
     * - update status + reduce stock when PAID
     */
    static async handleMidtransNotification(payload: MidtransNotification) {
      console.log("[v0] --- Midtrans Webhook Received ---")
      console.log("[v0] Payload:", JSON.stringify(payload, null, 2))

      const serverKey = requireEnv("MIDTRANS_SERVER_KEY")

      // Midtrans signature: sha512(order_id + status_code + gross_amount + server_key)
      const rawAmount = payload.gross_amount
      const amountInt = Math.floor(Number(rawAmount)).toString()

      const signatureSource = `${payload.order_id}${payload.status_code}${rawAmount}${serverKey}`
      const signatureSourceInt = `${payload.order_id}${payload.status_code}${amountInt}${serverKey}`

      const expected = sha512(signatureSource)
      const expectedInt = sha512(signatureSourceInt)

      console.log("[v0] Verification attempt:", {
        received: payload.signature_key,
        expectedRaw: expected,
        expectedInt: expectedInt,
        orderId: payload.order_id,
        statusCode: payload.status_code,
      })

      if (payload.signature_key !== expected && payload.signature_key !== expectedInt) {
        console.error("[v0] Signature Mismatch! Webhook rejected.")
        throw { status: 401, message: "Invalid Midtrans signature." }
      }

      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { orderNumber: payload.order_id },
            { midtransOrderId: payload.order_id },
            { orderNumber: `#${payload.order_id}` },
          ],
        },
        include: { items: true },
      })

      if (!order) {
        console.warn(`[v0] Order with ID ${payload.order_id} not found in database.`)
        return { ok: true, message: "Order not found, ignored." }
      }

      console.log(`[v0] Processing Order: ${order.orderNumber}, Current Status: ${order.paymentStatus}`)

      // idempotent
      if (order.paymentStatus === "PAID") {
        console.log("[v0] Order already marked as PAID. Skipping.")
        return { ok: true, message: "Already paid, ignored." }
      }

      const next = mapMidtransToInternal(payload.transaction_status, payload.fraud_status)
      console.log("[v0] Mapped Status:", next)

      await prisma.$transaction(async (tx) => {
        const va =
          Array.isArray(payload.va_numbers) && payload.va_numbers[0]?.va_number
            ? String(payload.va_numbers[0].va_number)
            : null

        // update order payment fields
        await tx.order.update({
          where: { id: order.id },
          data: {
            lastMidtransStatus: String(payload.transaction_status ?? ""),
            midtransTransactionId: payload.transaction_id ? String(payload.transaction_id) : order.midtransTransactionId,
            paymentMethod: payload.payment_type ? String(payload.payment_type) : order.paymentMethod,
            midtransVaNumber: va ?? order.midtransVaNumber,

            paymentStatus: next.paymentStatus,
            orderStatus: next.orderStatus,

            paidAt: next.paymentStatus === "PAID" ? new Date() : order.paidAt,

            cancelledAt:
              next.paymentStatus === "FAILED" ||
              next.paymentStatus === "EXPIRED" ||
              next.paymentStatus === "CANCELLED_BY_USER"
                ? new Date()
                : order.cancelledAt,
          },
        })

        // Reduce stock ONLY when PAID
        if (next.paymentStatus === "PAID") {
          // Clear user's cart items upon successful payment
          await tx.cartItem.deleteMany({
            where: {
              cart: {
                userId: order.userId,
              },
            },
          })

          for (const it of order.items) {
            // Jika kamu punya produk tanpa variant, tentukan policy.
            // Untuk sekarang: kalau tidak ada variantId, kita skip.
            if (!it.variantId) continue

            const updated = await tx.productVariant.updateMany({
              where: {
                id: it.variantId,
                stock: { gte: it.quantity },
              },
              data: { stock: { decrement: it.quantity } },
            })

            if (updated.count === 0) {
              // stok tidak cukup ketika payment settle
              // kamu bisa pilih: throw (rollback) agar investigasi manual
              throw {
                status: 409,
                message: `Stok variant ${it.variantId} tidak cukup saat pembayaran selesai.`,
              }
            }
          }
        }
      })

      return { ok: true }
    }
  }

  function mapMidtransToInternal(transactionStatus?: string, fraudStatus?: string) {
    // capture biasanya untuk kartu kredit
    if (transactionStatus === "capture") {
      if (fraudStatus === "challenge") {
        return { paymentStatus: "PENDING" as const, orderStatus: "AWAITING_PAYMENT" as const }
      }
      return { paymentStatus: "PAID" as const, orderStatus: "PROCESSING" as const }
    }

    if (transactionStatus === "settlement") {
      return { paymentStatus: "PAID" as const, orderStatus: "PROCESSING" as const }
    }

    if (transactionStatus === "pending") {
      return { paymentStatus: "PENDING" as const, orderStatus: "AWAITING_PAYMENT" as const }
    }

    if (transactionStatus === "expire") {
      return { paymentStatus: "EXPIRED" as const, orderStatus: "CANCELLED" as const }
    }

    if (transactionStatus === "cancel") {
      return { paymentStatus: "CANCELLED_BY_USER" as const, orderStatus: "CANCELLED" as const }
    }

    if (transactionStatus === "deny" || transactionStatus === "failure") {
      return { paymentStatus: "FAILED" as const, orderStatus: "CANCELLED" as const }
    }

    return { paymentStatus: "PENDING" as const, orderStatus: "AWAITING_PAYMENT" as const }
  }
