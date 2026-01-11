import { prisma } from "../../config/db";
import { badRequestError, conflictError, notFoundError } from "../../utils/appError";

type CartItemInput = {
  productId: number;
  variantId: number;
  quantity: number;
  price?: number;
};

async function getOrCreateCart(userId: number) {
  let cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  return cart;
}

export async function getUserCart(userId: number) {
  const cart = await getOrCreateCart(userId);

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
        // RECOMMENDED: include stock for UI (optional)
        select: {
          id: true,
          size: true,
          stock: true,
          productId: true,
        },
      },
    },
  });

  // Kalau kamu tidak mau mengubah response shape sekarang,
  // kamu bisa map ulang variant untuk buang stock/productId.
  // Tapi untuk best practice cart UI, stock di cart response sangat membantu.
  return { cartId: cart.id, items };
}

/**
 * Helper: validasi input numeric
 */
function assertFiniteNumber(value: any, fieldName: string): number {
  const n = Number(value);
  if (!Number.isFinite(n)) throw badRequestError(`${fieldName} tidak valid.`);
  return n;
}

/**
 * Helper: cek variant + stok
 */
async function getAndValidateVariant(productId: number, variantId: number) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true, productId: true, stock: true, size: true },
  });

  if (!variant) {
    throw notFoundError("Variant tidak ditemukan.", "VARIANT_NOT_FOUND");
  }

  if (variant.productId !== productId) {
    // penting untuk mencegah item “nyasar” ke product lain
    throw badRequestError("variantId tidak sesuai dengan productId.", "VARIANT_PRODUCT_MISMATCH");
  }

  return variant;
}

/**
 * Upsert item cart user dengan VALIDASI STOK di server.
 * - quantity <= 0 => delete
 * - quantity > stock => 409 Conflict
 */
export async function upsertCartItem(userId: number, input: CartItemInput) {
  const cart = await getOrCreateCart(userId);

  const productId = assertFiniteNumber(input.productId, "productId");
  const variantId = assertFiniteNumber(input.variantId, "variantId");
  const quantity = assertFiniteNumber(input.quantity, "quantity");

  if (productId <= 0) throw badRequestError("productId wajib diisi.");
  if (variantId <= 0) throw badRequestError("variantId wajib diisi.");

  const key = {
    cartId: cart.id,
    productId,
    variantId,
  };

  // delete
  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: key });
    return getUserCart(userId);
  }

  // VALIDASI STOK
  const variant = await getAndValidateVariant(productId, variantId);

  if (variant.stock <= 0) {
    throw conflictError(`Stok size ${variant.size} sudah habis.`, "OUT_OF_STOCK");
  }

  if (quantity > variant.stock) {
    throw conflictError(
      `Stok tersedia untuk size ${variant.size}: ${variant.stock}. Quantity diminta: ${quantity}.`,
      "INSUFFICIENT_STOCK"
    );
  }

  const existing = await prisma.cartItem.findFirst({ where: key });

  if (!existing) {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId,
        quantity,
      },
    });
  } else {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity },
    });
  }

  return getUserCart(userId);
}

/**
 * Sync guest -> user cart
 *
 * Best practice:
 * - Jangan bikin login gagal cuma gara-gara 1 item invalid.
 * - Maka strategi aman: CLAMP qty ke stok (atau skip kalau stok 0).
 * - Ini juga menghindari konflik UX.
 */
export async function syncCart(userId: number, guestItems: CartItemInput[]) {
  const cart = await getOrCreateCart(userId);

  if (!guestItems || guestItems.length === 0) {
    return getUserCart(userId);
  }

  const existingItems = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    select: { id: true, productId: true, variantId: true, quantity: true },
  });

  const existingMap = new Map<string, { id: number; quantity: number }>();
  for (const item of existingItems) {
    existingMap.set(`${item.productId}:${item.variantId}`, { id: item.id, quantity: item.quantity });
  }

  for (const gi of guestItems) {
    const productId = Number(gi.productId);
    const variantId = Number(gi.variantId);
    const quantity = Number(gi.quantity);

    if (!Number.isFinite(productId) || productId <= 0) continue;
    if (!Number.isFinite(variantId) || variantId <= 0) continue;
    if (!Number.isFinite(quantity) || quantity <= 0) continue;

    const mapKey = `${productId}:${variantId}`;
    const found = existingMap.get(mapKey);
    if (found) continue; // kamu memilih "server wins"

    // VALIDASI VARIANT + STOCK
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, productId: true, stock: true, size: true },
    });

    if (!variant) continue;
    if (variant.productId !== productId) continue;

    if (variant.stock <= 0) continue;

    const finalQty = Math.min(quantity, variant.stock);
    if (finalQty <= 0) continue;

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId,
        quantity: finalQty,
      },
    });

    existingMap.set(mapKey, { id: -1, quantity: finalQty });
  }

  return getUserCart(userId);
}

export async function removeCartItem(userId: number, itemId: number) {
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({
    where: {
      id: itemId,
      cartId: cart.id,
    },
  });

  return getUserCart(userId);
}

export async function clearCart(userId: number) {
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return getUserCart(userId);
}
