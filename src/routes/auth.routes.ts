// backend/src/routes/auth.routes.ts
import { Router } from "express";
import { login, twoFactor, logout } from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);
router.post("/two-factor", twoFactor);
router.post("/logout", logout);

export default router;
