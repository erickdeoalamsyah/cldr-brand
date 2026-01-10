import { prisma } from "../../config/db"

type CartItemInput = {
  productId: number
  variantId: number // ✅ wajib sesuai schema
  quantity: number
  price?: number // optional kalau nanti mau snapshot
}

/**
 * Pastikan user selalu punya cart (1 user 1 cart).
 */
async function getOrCreateCart(userId: number) {
  let cart = await prisma.cart.findUnique({ where: { userId } })

  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } })
  }

  return cart
}

/**
 * Ambil cart + item lengkap untuk user (dipakai GET /cart & setelah update).
 */
export async function getUserCart(userId: number) {
  const cart = await getOrCreateCart(userId)

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    orderBy: { createdAt: "asc" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: {
            orderBy: { position: "asc" },
            take: 1,
          },
        },
      },
      variant: {
        select: {
          id: true,
          size: true,
        },
      },
    },
  })

  return { cartId: cart.id, items }
}

/**
 * Tambah / update satu item cart user.
 * - kalau belum ada → create
 * - kalau ada → update quantity
 * - kalau quantity <= 0 → hapus
 */
export async function upsertCartItem(userId: number, input: CartItemInput) {
  const cart = await getOrCreateCart(userId)

  // guard basic
  if (!input.productId || !input.variantId) {
    throw new Error("productId dan variantId wajib diisi.")
  }
  if (!Number.isFinite(input.quantity)) {
    throw new Error("quantity tidak valid.")
  }

  const key = {
    cartId: cart.id,
    productId: input.productId,
    variantId: input.variantId,
  }

  if (input.quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: key })
    return getUserCart(userId)
  }

  const existing = await prisma.cartItem.findFirst({ where: key })

  if (!existing) {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: input.productId,
        variantId: input.variantId,
        quantity: input.quantity,
        // price: input.price ?? 0, // kalau kamu sudah pakai snapshot price
      },
    })
  } else {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: input.quantity },
    })
  }

  return getUserCart(userId)
}

/**
 * Sinkronisasi cart guest → cart user setelah login.
 * guestItems: daftar { productId, variantId, quantity }
 */
export async function syncCart(userId: number, guestItems: CartItemInput[]) {
  const cart = await getOrCreateCart(userId)

  if (!guestItems || guestItems.length === 0) {
    return getUserCart(userId)
  }

  // Ambil semua item yang sudah ada di cart user
  const existingItems = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
  })

  // Map untuk cek apakah kombinasi productId+variantId sudah ada
  const existingMap = new Map<string, { id: number; quantity: number }>()
  for (const item of existingItems) {
    existingMap.set(`${item.productId}:${item.variantId}`, { id: item.id, quantity: item.quantity })
  }

  for (const gi of guestItems) {
    // guard
    if (!gi.productId || !gi.variantId || !gi.quantity) continue
    if (gi.quantity <= 0) continue

    const mapKey = `${gi.productId}:${gi.variantId}`
    const found = existingMap.get(mapKey)

    // best practice sync: kalau sudah ada, biarkan qty server (atau kamu bisa tambah qty, pilih salah satu)
    // di sini aku ikuti logika kamu: kalau sudah ada, skip (jangan double)
    if (found) continue

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: gi.productId,
        variantId: gi.variantId,
        quantity: gi.quantity,
        // price: gi.price ?? 0,
      },
    })

    // update map local supaya loop aman
    existingMap.set(mapKey, { id: -1, quantity: gi.quantity })
  }

  return getUserCart(userId)
}

export async function removeCartItem(userId: number, itemId: number) {
  const cart = await getOrCreateCart(userId)

  await prisma.cartItem.deleteMany({
    where: {
      id: itemId,
      cartId: cart.id,
    },
  })

  return getUserCart(userId)
}

/**
 * Pastikan fungsi ini dipanggil di tempat yang tepat (Checkout atau Webhook)
 */
export async function clearCart(userId: number) {
  const cart = await getOrCreateCart(userId)

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  })

  return getUserCart(userId)
}
