import { Router } from "express";
import { ProductController } from "./product.controller";

const router = Router();

// Semua route di sini sudah dilewati authRequired + adminOnly dari app.ts
router.get("/", ProductController.adminList);
router.post("/", ProductController.adminCreate);
router.get("/:id", ProductController.adminGet);
router.put("/:id", ProductController.adminUpdate);
router.delete("/:id", ProductController.adminDelete);

export default router;
