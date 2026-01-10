// src/modules/address/address.routes.ts
import { Router } from "express";
import {
  authRequired,
  AuthRequest,
} from "../../middlewares/auth.middleware";
import { AddressService } from "./address.service";
import {
  ok,
  badRequest,
} from "../../utils/response";

const router = Router();

// Semua endpoint alamat wajib login
router.use(authRequired);

// GET /addresses
router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const addresses = await AddressService.listForUser(userId);
    return ok(res, addresses);
  } catch (err) {
    next(err);
  }
});

// POST /addresses
router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const address = await AddressService.createForUser(
      userId,
      req.body
    );
    return ok(res, address, "Alamat berhasil ditambahkan.");
  } catch (err) {
    next(err);
  }
});

// PUT /addresses/:id
router.put("/:id", async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id, 10);
    if (!id || Number.isNaN(id)) {
      return badRequest(res, "ID alamat tidak valid.");
    }

    const address = await AddressService.updateForUser(
      id,
      userId,
      req.body
    );
    return ok(res, address, "Alamat berhasil diperbarui.");
  } catch (err) {
    next(err);
  }
});

// DELETE /addresses/:id
router.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id, 10);
    if (!id || Number.isNaN(id)) {
      return badRequest(res, "ID alamat tidak valid.");
    }

    await AddressService.deleteForUser(id, userId);
    return ok(res, null, "Alamat berhasil dihapus.");
  } catch (err) {
    next(err);
  }
});

// POST /addresses/:id/set-primary
router.post(
  "/:id/set-primary",
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.id;
      const id = parseInt(req.params.id, 10);
      if (!id || Number.isNaN(id)) {
        return badRequest(res, "ID alamat tidak valid.");
      }

      await AddressService.setPrimaryForUser(id, userId);
      return ok(res, null, "Alamat utama berhasil diubah.");
    } catch (err) {
      next(err);
    }
  }
);

export default router;
