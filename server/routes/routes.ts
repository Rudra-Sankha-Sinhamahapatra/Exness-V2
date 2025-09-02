import { Router } from "express";
import { signup, signin, authPost  } from "../controllers/auth";
import { authMiddleware } from "../authMiddleware";
import { getUsdcBalance, getUserBalance } from "../controllers/balance";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/signin/post", authPost);
router.get('/balance',authMiddleware,getUserBalance);
router.get('/balance/usd', authMiddleware, getUsdcBalance);

export default router;
