import { Router } from "express";
import productAdminRoutes from "../products/product.admin.routes";
import adminOrdersRoutes from "../orders/orders.admin.routes";

const router = Router();

router.use("/products", productAdminRoutes);
router.use("/orders", adminOrdersRoutes);

export default router;
