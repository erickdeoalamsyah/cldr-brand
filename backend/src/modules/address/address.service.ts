// src/modules/address/address.service.ts
import { prisma } from "../../config/db";
import {
  createAddressSchema,
  updateAddressSchema,
} from "./address.schemas";

export class AddressService {
  static async listForUser(userId: number) {
    const items = await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isPrimary: "desc" },
        { createdAt: "desc" },
      ],
    });

    return items;
  }

  static async createForUser(userId: number, input: unknown) {
    const parsed = createAddressSchema.parse(input);

    const address = await prisma.address.create({
      data: {
        userId,
        label: parsed.label ?? null,
        recipientName: parsed.recipientName,
        phone: parsed.phone,
        addressLine: parsed.addressLine,
        postalCode: parsed.postalCode ?? null,
        provinceId: parsed.provinceId,
        cityId: parsed.cityId,
        subdistrictId: parsed.subdistrictId,
       provinceName: parsed.provinceName,
    cityName: parsed.cityName,
    subdistrictName: parsed.subdistrictName,
        // isPrimary default false; nanti bisa ada rule kalau alamat pertama otomatis utama
      },
    });

    return address;
  }

  static async updateForUser(
    id: number,
    userId: number,
    input: unknown
  ) {
    const parsed = updateAddressSchema.parse(input);

    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw { status: 404, message: "Alamat tidak ditemukan." };
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        label:
          parsed.label !== undefined ? parsed.label : existing.label,
        recipientName:
          parsed.recipientName ?? existing.recipientName,
        phone: parsed.phone ?? existing.phone,
        addressLine: parsed.addressLine ?? existing.addressLine,
        postalCode:
          parsed.postalCode !== undefined
            ? parsed.postalCode
            : existing.postalCode,
        provinceId: parsed.provinceId ?? existing.provinceId,
    cityId: parsed.cityId ?? existing.cityId,
    subdistrictId: parsed.subdistrictId ?? existing.subdistrictId,
    // UPDATE NAMA:
    provinceName: parsed.provinceName ?? existing.provinceName,
    cityName: parsed.cityName ?? existing.cityName,
    subdistrictName: parsed.subdistrictName ?? existing.subdistrictName,
      },
    });

    return address;
  }

  static async deleteForUser(id: number, userId: number) {
    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw { status: 404, message: "Alamat tidak ditemukan." };
    }

    await prisma.address.delete({ where: { id } });
  }

  static async setPrimaryForUser(id: number, userId: number) {
    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw { status: 404, message: "Alamat tidak ditemukan." };
    }

    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId },
        data: { isPrimary: false },
      }),
      prisma.address.update({
        where: { id },
        data: { isPrimary: true },
      }),
    ]);
  }
}
