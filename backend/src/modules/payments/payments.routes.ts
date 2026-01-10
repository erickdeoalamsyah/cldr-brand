// src/modules/payments/payments.routes.ts
import { Router } from "express"
import { authRequired, AuthRequest } from "../../middlewares/auth.middleware"
import { validateBody } from "../../middlewares/validate.middleware"
import { ok } from "../../utils/response"
import { z } from "zod"
import { PaymentsService } from "./payments.service"

const router = Router()

const createRedirectSchema = z.object({
  orderNumber: z.string().min(5),
})

// user create redirect url
router.post(
  "/midtrans/redirect-url",
  authRequired,
  validateBody(createRedirectSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const { orderNumber } = req.body
      const result = await PaymentsService.createMidtransRedirectUrl(req.user!.id, orderNumber)
      return ok(res, result)
    } catch (err) {
      next(err)
    }
  }
)

/**
 * Midtrans webhook (NO AUTH, NO REDIRECT)
 * - Return 2xx when received to avoid retry storms.
 * - Midtrans retry behavior depends on HTTP code. :contentReference[oaicite:4]{index=4}
 */
router.post("/midtrans/notify", async (req, res) => {
  try {
    const result = await PaymentsService.handleMidtransNotification(req.body)
    // Always 200 for "accepted & processed/ignored"
    return res.status(200).json({ success: true, ...result })
  } catch (err: any) {
    // 🔥 Best practice for webhook:
    // If we return non-2xx, Midtrans may retry (depends on status). :contentReference[oaicite:5]{index=5}
    // Many teams prefer returning 200 even on invalid payload to prevent retries.
    const status = err?.status ?? 500

    // Option A (recommended for dev/production stability): always 200, just log
    console.error("[midtrans] notify handler error:", err)
    return res.status(200).json({
      success: false,
      // keep message short (don’t leak internals)
      message: status === 401 ? "invalid signature" : "notification error",
    })

    // Option B (strict): return 401 for invalid signature (may cause retries)
    // if (status === 401) return res.status(401).json({ success: false, message: "invalid signature" })
    // return res.status(500).json({ success: false, message: "notification error" })
  }
})

export default router
