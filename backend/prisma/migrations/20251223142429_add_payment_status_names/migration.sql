-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "lastMidtransStatus" TEXT,
ADD COLUMN     "midtransRedirectUrl" TEXT,
ADD COLUMN     "midtransSnapToken" TEXT,
ADD COLUMN     "paymentExpiresAt" TIMESTAMP(3);
