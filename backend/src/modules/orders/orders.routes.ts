import { Router } from "express";
import { authRequired, type AuthRequest } from "../../middlewares/auth.middleware";
import { ok } from "../../utils/response";
import { OrdersService } from "./orders.service";

const router = Router();

// ✅ USER: list order history
router.get("/", authRequired, async (req: AuthRequest, res, next) => {
  try {
    const data = await OrdersService.listUserOrders(req.user!.id);
    return ok(res, data);
  } catch (e) {
    next(e);
  }
});

// ✅ USER: detail order
router.get("/:orderNumber", authRequired, async (req: AuthRequest, res, next) => {
  try {
    const data = await OrdersService.getUserOrderDetail(req.user!.id, req.params.orderNumber);
    return ok(res, data);
  } catch (e) {
    next(e);
  }
});

export default router;
