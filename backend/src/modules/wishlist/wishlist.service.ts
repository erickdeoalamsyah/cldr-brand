import { prisma } from "../../config/db";

export async function getWishlist(userId: number) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
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
    },
  });

  return items;
}

/**
 * Toggle:
 * - kalau belum ada -> create
 * - kalau sudah ada -> delete
 */
export async function toggleWishlist(userId: number, productId: number) {
  const existing = await prisma.wishlistItem.findFirst({
    where: { userId, productId },
  });

  if (existing) {
    await prisma.wishlistItem.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.wishlistItem.create({
      data: { userId, productId },
    });
  }

  return getWishlist(userId);
}
