import { Router } from "express";
import { AuthController } from "./auth.controller";
import {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.schemas";
import { validateBody } from "../../middlewares/validate.middleware";

const router = Router();


router.post("/register", validateBody(registerSchema), AuthController.register);
router.post("/login", validateBody(loginSchema), AuthController.login);

router.post(
  "/resend-verification",
  validateBody(resendVerificationSchema),
  AuthController.resendVerification
);

router.get("/verify-email", AuthController.verifyEmail);

router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  AuthController.resetPassword
);

export default router;
