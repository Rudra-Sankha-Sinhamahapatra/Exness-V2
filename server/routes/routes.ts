import { Router } from "express";
import { signup, signin, authPost  } from "../controllers/auth";
import { authMiddleware } from "../authMiddleware";
import { getUsdcBalance, getUserBalance } from "../controllers/balance";
import { supportedAssets } from "../controllers/assets";
import { closeTrade, createTrade } from "../controllers/trade";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/signin/post", authPost);
router.get('/balance',authMiddleware,getUserBalance);
router.get('/balance/usd', authMiddleware, getUsdcBalance);
router.get('/supportedAssets',supportedAssets);
router.post('/trade/create', authMiddleware,createTrade);
router.post('/trade/close', authMiddleware, closeTrade);

export default router;
