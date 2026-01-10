import { Router } from "express";
import { authRequired, AuthRequest } from "../../middlewares/auth.middleware";
import {
  getUserCart,
  upsertCartItem,
  syncCart,
  removeCartItem,
  clearCart,
} from "./cart.service";

const router = Router();

// GET /api/cart -> ambil cart user
router.get("/cart", authRequired, async (req: AuthRequest, res, next) => {
  try {
    const cart = await getUserCart(req.user!.id);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// POST /api/cart/item -> tambah / update satu item
router.post("/cart/item", authRequired, async (req: AuthRequest, res, next) => {
  try {
    const { productId, variantId, quantity } = req.body;

if (!productId) {
  return res.status(400).json({ success: false, message: "productId wajib diisi." });
}

if (variantId === null || variantId === undefined) {
  return res.status(400).json({ success: false, message: "variantId wajib diisi." });
}

const vId = Number(variantId);
if (Number.isNaN(vId)) {
  return res.status(400).json({ success: false, message: "variantId tidak valid." });
}

   const cart = await upsertCartItem(req.user!.id, {
  productId: Number(productId),
  variantId: vId,
  quantity: Number(quantity ?? 1),
});


    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// POST /api/cart/sync -> guest cart -> user cart (setelah login)
router.post("/cart/sync", authRequired, async (req: AuthRequest, res, next) => {
  try {
    const guestItemsRaw = Array.isArray(req.body.items) ? req.body.items : [];

    const guestItems = guestItemsRaw
  .map((i: any) => ({
    productId: Number(i.productId),
    variantId: Number(i.variantId),
    quantity: Number(i.quantity ?? 1),
  }))
  .filter((i: any) => i.productId && i.variantId && i.quantity > 0 && !Number.isNaN(i.variantId));


    const cart = await syncCart(req.user!.id, guestItems);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/item/:id -> hapus satu item
router.delete(
  "/cart/item/:id",
  authRequired,
  async (req: AuthRequest, res, next) => {
    try {
      const itemId = Number(req.params.id);
      if (Number.isNaN(itemId)) {
        return res
          .status(400)
          .json({ success: false, message: "ID item tidak valid." });
      }

      const cart = await removeCartItem(req.user!.id, itemId);
      res.json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/cart -> clear cart
router.delete("/cart", authRequired, async (req: AuthRequest, res, next) => {
  try {
    const cart = await clearCart(req.user!.id);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

export default router;
