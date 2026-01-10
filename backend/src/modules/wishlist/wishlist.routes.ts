import { Router } from "express";
import { authRequired, AuthRequest } from "../../middlewares/auth.middleware";
import { getWishlist, toggleWishlist } from "./wishlist.service";

const router = Router();

// GET /api/wishlist
router.get("/wishlist", authRequired, async (req: AuthRequest, res, next) => {
  try {
    const items = await getWishlist(req.user!.id);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

// POST /api/wishlist/toggle
router.post(
  "/wishlist/toggle",
  authRequired,
  async (req: AuthRequest, res, next) => {
    try {
      const { productId } = req.body;
      if (!productId) {
        return res
          .status(400)
          .json({ success: false, message: "productId wajib diisi." });
      }

      const items = await toggleWishlist(req.user!.id, Number(productId));
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
