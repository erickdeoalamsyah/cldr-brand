import { Router } from "express";
import { authRequired, AuthRequest } from "../../middlewares/auth.middleware";
import { getUserCart, upsertCartItem, syncCart, removeCartItem, clearCart } from "./cart.service";

const router = Router();

router.get("/cart", authRequired, async (req: AuthRequest, res, next) => {
  try {
    const cart = await getUserCart(req.user!.id);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

router.post("/cart/item", authRequired, async (req: AuthRequest, res, next) => {
  try {
    const productId = Number(req.body.productId);
    const variantId = Number(req.body.variantId);
    const quantity = Number(req.body.quantity ?? 1);

    const cart = await upsertCartItem(req.user!.id, { productId, variantId, quantity });
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

router.post("/cart/sync", authRequired, async (req: AuthRequest, res, next) => {
  try {
    const raw = Array.isArray(req.body.items) ? req.body.items : [];
    const guestItems = raw
      .map((i: any) => ({
        productId: Number(i.productId),
        variantId: Number(i.variantId),
        quantity: Number(i.quantity ?? 1),
      }))
      .filter((i: any) => Number.isFinite(i.productId) && Number.isFinite(i.variantId) && Number.isFinite(i.quantity));

    const cart = await syncCart(req.user!.id, guestItems);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

router.delete("/cart/item/:id", authRequired, async (req: AuthRequest, res, next) => {
  try {
    const itemId = Number(req.params.id);
    const cart = await removeCartItem(req.user!.id, itemId);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

router.delete("/cart", authRequired, async (req: AuthRequest, res, next) => {
  try {
    const cart = await clearCart(req.user!.id);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

export default router;
