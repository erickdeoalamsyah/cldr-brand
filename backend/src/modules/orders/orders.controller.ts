import type { Request, Response, NextFunction } from "express"
import { OrdersService } from "./orders.service"

export class OrdersController {
  // USER METHODS
  static async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id
      const orders = await OrdersService.listUserOrders(userId)
      res.json({ success: true, data: orders })
    } catch (error) {
      next(error)
    }
  }

  static async getOrderDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id
      const { orderNumber } = req.params
      const order = await OrdersService.getUserOrderDetail(userId, orderNumber)
      res.json({ success: true, data: order })
    } catch (error) {
      next(error)
    }
  }

  // ADMIN METHODS
  static async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await OrdersService.listAllOrders()
      res.json({ success: true, data: orders })
    } catch (error) {
      next(error)
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderNumber } = req.params
      const { status } = req.body
      const order = await OrdersService.adminUpdateStatus(orderNumber, status)
      res.json({ success: true, message: `Status order ${orderNumber} berhasil diubah menjadi ${status}`, data: order })
    } catch (error) {
      next(error)
    }
  }

  static async updateTracking(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderNumber } = req.params
      const { trackingNumber } = req.body
      const order = await OrdersService.adminUpdateTracking(orderNumber, trackingNumber)
      res.json({ success: true, message: `Nomor resi untuk order ${orderNumber} berhasil diperbarui`, data: order })
    } catch (error) {
      next(error)
    }
  }
}
