// src/modules/shipping/shipping.routes.ts
import { Router } from "express";
import { ShippingService } from "./shipping.service";
import { ok, badRequest } from "../../utils/response";
import { authRequired, AuthRequest } from "../../middlewares/auth.middleware";

const router = Router();

// Public: list province, city, district, subdistrict
router.get("/provinces", async (_req, res, next) => {
  try {
    const data = await ShippingService.getProvinces();
    return ok(res, data);
  } catch (err) {
    next(err);
  }
});

router.get("/cities", async (req, res, next) => {
  try {
    const provinceId = parseInt(String(req.query.provinceId), 10);
    if (!provinceId || Number.isNaN(provinceId)) {
      return badRequest(res, "provinceId wajib diisi dan berupa angka");
    }

    const data = await ShippingService.getCities(provinceId);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
});

router.get("/districts", async (req, res, next) => {
  try {
    const cityId = parseInt(String(req.query.cityId), 10);
    if (!cityId || Number.isNaN(cityId)) {
      return badRequest(res, "cityId wajib diisi dan berupa angka");
    }

    const data = await ShippingService.getDistricts(cityId);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
});

router.get("/subdistricts", async (req, res, next) => {
  try {
    const districtId = parseInt(String(req.query.districtId), 10);
    if (!districtId || Number.isNaN(districtId)) {
      return badRequest(res, "districtId wajib diisi dan berupa angka");
    }

    const data = await ShippingService.getSubdistricts(districtId);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
});

// Protected: cek ongkir untuk user login (pakai Address nanti)
router.post(
  "/estimate",
  authRequired,
  async (req: AuthRequest, res, next) => {
    try {
      const { destinationId, weightGrams, courier } = req.body as {
        destinationId: number;
        weightGrams: number;
        courier: string;
      };

      if (!destinationId || !weightGrams || !courier) {
        return badRequest(
          res,
          "destinationId, weightGrams, dan courier wajib diisi"
        );
      }

      const data = await ShippingService.estimateShippingCost({
        destinationId: Number(destinationId),
        weightGrams: Number(weightGrams),
        courier,
      });

      return ok(res, data);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
