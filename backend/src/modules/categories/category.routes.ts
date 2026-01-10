import { Router } from "express";
import { authRequired, adminOnly } from "../../middlewares/auth.middleware";
import {
  listCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  listCategoriesPublic,
} from "./category.service";

const router = Router();

// admin: list
router.get("/admin/categories", authRequired, adminOnly, async (req, res, next) => {
  try {
    const categories = await listCategoriesAdmin();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

// admin: create
router.post("/admin/categories", authRequired, adminOnly, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Nama kategori wajib diisi." });
    }
    const category = await createCategory({ name: name.trim() });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
});

// admin: update
router.put("/admin/categories/:id", authRequired, adminOnly, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID kategori tidak valid." });
    }

    const { name, isVisible } = req.body;

    const category = await updateCategory(id, {
      name,
      isVisible,
    });

    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
});

// admin: delete
router.delete("/admin/categories/:id", authRequired, adminOnly, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID kategori tidak valid." });
    }

    await deleteCategory(id);
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

// public: list (buat FE)
router.get("/categories", async (req, res, next) => {
  try {
    const categories = await listCategoriesPublic();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

export default router;
