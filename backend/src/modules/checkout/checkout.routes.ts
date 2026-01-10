// src/modules/checkout/checkout.routes.ts
import { Router } from "express";
import { authRequired, AuthRequest } from "../../middlewares/auth.middleware";
import { validateBody } from "../../middlewares/validate.middleware";
import { ok, badRequest } from "../../utils/response";
import { CheckoutService } from "./checkout.service";
import { createOrderSchema } from "./checkout.schemas";

const router = Router();

// Semua endpoint checkout wajib login
router.use(authRequired);

/**
 * GET /api/checkout/summary?addressId=&courier=
 *
 * - addressId (opsional): kalau dikirim, pakai alamat itu
 * - courier (opsional): jne / jnt / dsb → kalau ada, server juga hit ongkir dan kirim shippingEstimate
 */
router.get("/summary", async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const addressIdParam = req.query.addressId
      ? parseInt(String(req.query.addressId), 10)
      : undefined;

    if (addressIdParam !== undefined && Number.isNaN(addressIdParam)) {
      return badRequest(res, "addressId tidak valid.");
    }

    const courier =
      typeof req.query.courier === "string" &&
      req.query.courier.trim() !== ""
        ? req.query.courier.trim()
        : undefined;

    const summary = await CheckoutService.getSummary(userId, {
      addressId: addressIdParam,
      courier,
    });

    return ok(res, summary);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/checkout/create-order
 * Body: { addressId?: number, courier: string, courierService: string }
 */
router.post(
  "/create-order",
  validateBody(createOrderSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.id;

      const order = await CheckoutService.createOrder(userId, req.body);

      return ok(res, order, "Order berhasil dibuat.");
    } catch (err) {
      next(err);
    }
  }
);

export default router;
