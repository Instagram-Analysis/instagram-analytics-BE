import { Router } from "express";
import {
  oauthRedirect,
  oauthCallback,
  login,
  twoFactor,
  logout,
} from "../controllers/auth.controller";

const router = Router();

// 1) Kick off the OAuth flow
router.get("/oauth", oauthRedirect);

// 2) Handle the OAuth callback
//    → must match your INSTAGRAM_REDIRECT_URI
router.get("/callback", oauthCallback);

// 3) (Legacy) Username/password login & two-factor
router.post("/login", login);
router.post("/two-factor", twoFactor);

// 4) Logout
router.post("/logout", logout);

export default router;
