/*
  Warnings:

  - You are about to drop the column `sku` on the `ProductVariant` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ProductVariant_sku_key";

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "sku";
