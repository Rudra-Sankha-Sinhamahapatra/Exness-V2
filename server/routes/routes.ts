import { Router } from "express";
import { signup, signin, authPost  } from "../controllers/auth";
import { authMiddleware } from "../authMiddleware";
import { getUsdcBalance, getUserBalance } from "../controllers/balance";
import { supportedAssets, upsertAssets } from "../controllers/assets";
import { closeTrade, createTrade } from "../controllers/trade";
import { getKlines } from "../controllers/klines";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/signin/post", authPost);
router.get('/balance',authMiddleware,getUserBalance);
router.get('/balance/usd', authMiddleware, getUsdcBalance);
router.get('/supportedAssets',supportedAssets);
// router.post('/assets/createorupdate', upsertAssets);
router.post('/trade/create', authMiddleware,createTrade);
router.post('/trade/close', authMiddleware, closeTrade);
router.get('/klines',getKlines);

export default router;
