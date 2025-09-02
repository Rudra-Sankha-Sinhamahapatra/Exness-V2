import { Router } from "express";
import { signup, signin, authPost  } from "../controllers/auth";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/signin/post", authPost);

export default router;
