import { Request, Response, NextFunction } from "express";
import { ProductService } from "./product.service";
import { ok, created } from "../../utils/response";

export class ProductController {
  static async listPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.listPublic(req.query);
      return ok(res, result, "Daftar produk.");
    } catch (err) {
      next(err);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const product = await ProductService.getBySlug(slug);
      return ok(res, product, "Detail produk.");
    } catch (err) {
      next(err);
    }
  }

  // ADMIN

  static async adminList(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await ProductService.adminList();
      return ok(res, items, "Daftar produk (admin).");
    } catch (err) {
      next(err);
    }
  }

  static async adminCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.adminCreate(req.body);
      return created(res, product, "Produk berhasil dibuat.");
    } catch (err) {
      next(err);
    }
  }

  static async adminGet(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const product = await ProductService.adminGet(id);
      return ok(res, product, "Detail produk (admin).");
    } catch (err) {
      next(err);
    }
  }

  static async adminUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const product = await ProductService.adminUpdate(id, req.body);
      return ok(res, product, "Produk berhasil diperbarui.");
    } catch (err) {
      next(err);
    }
  }

  static async adminDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await ProductService.adminDelete(id);
      return ok(res, null, "Produk berhasil dihapus.");
    } catch (err) {
      next(err);
    }
  }
}
