import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import adminRoutes from "./modules/admin/admin.routes";
import productRoutes from "./modules/products/product.routes";
import { authRequired, adminOnly } from "./middlewares/auth.middleware";
import uploadRoutes from "./modules/uploads/upload.routes";
import categoryRoutes from "./modules/categories/category.routes";
import cartRoutes from "./modules/cart/cart.routes";
import wishlistRoutes from "./modules/wishlist/wishlist.routes";
import shippingRoutes from "./modules/shipping/shipping.routes";
import addressRoutes from "./modules/address/address.routes";
import checkoutRoutes from "./modules/checkout/checkout.routes";
import paymentRoutes from "./modules/payments/payments.routes";
import ordersRoutes from "./modules/orders/orders.routes";


const app = express();

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000"], // sesuaikan nanti untuk production
    credentials: true,
  })
);

app.use(express.json());

// Rate limit khusus endpoint auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100,
  message: "Too many requests, please try again later.",
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// AUTH ROUTES
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);

app.use("/api", categoryRoutes);
app.use("/api", uploadRoutes);
app.use("/api", cartRoutes);
app.use("/api", wishlistRoutes);

// SHIPPING & ADDRESS
app.use("/api/shipping", shippingRoutes);
app.use("/api/addresses", addressRoutes);

app.use("/api/checkout", checkoutRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/orders", ordersRoutes);


// ADMIN ROUTES – hanya bisa diakses jika login + role ADMIN
app.use("/api/admin", authRequired, adminOnly, adminRoutes);

// Global error handler
app.use(errorHandler);

export default app;
