import { Router } from "express";
import { authRequired, adminOnly, type AuthRequest } from "../../middlewares/auth.middleware";
import { ok } from "../../utils/response";
import { validateBody } from "../../middlewares/validate.middleware";
import { z } from "zod";
import { OrdersService } from "./orders.service";

const router = Router();

// ✅ GET /api/admin/orders
router.get("/", authRequired, adminOnly, async (_req: AuthRequest, res, next) => {
  try {
    const data = await OrdersService.adminListOrders();
    return ok(res, data);
  } catch (e) {
    next(e);
  }
});

// ✅ GET /api/admin/orders/:orderNumber
router.get("/:orderNumber", authRequired, adminOnly, async (req: AuthRequest, res, next) => {
  try {
    const data = await OrdersService.adminGetOrderDetail(req.params.orderNumber);
    return ok(res, data);
  } catch (e) {
    next(e);
  }
});

router.patch(
  "/:orderNumber/status",
  authRequired,
  adminOnly,
  validateBody(z.object({ status: z.enum(["AWAITING_PAYMENT", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"]) })),
  async (req, res, next) => {
    try {
      const data = await OrdersService.adminUpdateStatus(req.params.orderNumber, req.body.status);
      return ok(res, data);
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  "/:orderNumber/tracking",
  authRequired,
  adminOnly,
  validateBody(z.object({ trackingNumber: z.string().min(3) })),
  async (req, res, next) => {
    try {
      const data = await OrdersService.adminUpdateTracking(req.params.orderNumber, req.body.trackingNumber);
      return ok(res, data);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
