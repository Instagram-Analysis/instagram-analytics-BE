import { Router } from 'express';
import {
  getFollowers,
  getFollowing,
  getNonFollowers,
  getTopLikers
} from '../controllers/instagram.controller';

const router = Router();

router.get('/followers',     getFollowers);
router.get('/following',     getFollowing);
router.get('/non-followers', getNonFollowers);
router.get('/top-likers',    getTopLikers);

export default router;
