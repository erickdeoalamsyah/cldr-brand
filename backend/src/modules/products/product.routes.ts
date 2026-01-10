import { Router } from "express";
import { ProductController } from "./product.controller";

const router = Router();

// public
router.get("/", ProductController.listPublic);
router.get("/:slug", ProductController.getBySlug);

export default router;
