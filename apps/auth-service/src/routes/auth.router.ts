import express, { Router } from "express";
import { loginUser, userRegisteration, verifyUser } from "../controllers/auth.controller";

const router: Router = express.Router();

router.post("/user-registration", userRegisteration);
router.post("/verify-user", verifyUser);
router.post("/login-user",loginUser)

export default router;