import express, { Router } from "express";
import { userRegisteration, verifyUser } from "../controllers/auth.controller";

const router: Router = express.Router();

router.post("/user-registration", userRegisteration);
router.post("/verify-user", verifyUser);

export default router;