// src/modules/payments/midtrans.ts
import midtransClient from "midtrans-client";

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
const serverKey = process.env.MIDTRANS_SERVER_KEY!;
const clientKey = process.env.MIDTRANS_CLIENT_KEY!;

if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY is required");
if (!clientKey) throw new Error("MIDTRANS_CLIENT_KEY is required");

export const midtransSnap = new midtransClient.Snap({
  isProduction,
  serverKey,
  clientKey,
});
