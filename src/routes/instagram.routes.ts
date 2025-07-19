// backend/src/routes/instagram.routes.ts
import { Router } from "express";
import ensureLoggedIn from "../middleware/ensureLoggedIn";
import {
  getFollowers,
  getFollowing,
  getNonFollowers,
  getTopLikers,
} from "../controllers/instagram.controller";

const router = Router();

// apply guard
router.use(ensureLoggedIn);

router.get("/followers", getFollowers);
router.get("/following", getFollowing);
router.get("/non-followers", getNonFollowers);
router.get("/top-likers", getTopLikers);

export default router;
