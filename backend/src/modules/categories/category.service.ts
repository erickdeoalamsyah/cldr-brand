import { prisma } from "../../config/db";

export async function listCategoriesAdmin() {
  return prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createCategory(input: { name: string }) {
  const slug = slugify(input.name);

  return prisma.category.create({
    data: {
      name: input.name,
      slug,
      isVisible: true,
    },
  });
}

export async function updateCategory(id: number, input: { name?: string; isVisible?: boolean }) {
  const data: any = {};

  if (typeof input.name === "string") {
    data.name = input.name;
    data.slug = slugify(input.name);
  }
  if (typeof input.isVisible === "boolean") {
    data.isVisible = input.isVisible;
  }

  return prisma.category.update({
    where: { id },
    data,
  });
}

export async function deleteCategory(id: number) {
  // opsional: cek dulu apakah masih dipakai product
  const productCount = await prisma.product.count({
    where: { categoryId: id },
  });

  if (productCount > 0) {
    throw new Error("Kategori masih digunakan oleh produk, tidak bisa dihapus.");
  }

  await prisma.category.delete({
    where: { id },
  });

  return true;
}

export async function listCategoriesPublic() {
  return prisma.category.findMany({
    where: { isVisible: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
