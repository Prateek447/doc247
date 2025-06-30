import express, { Router } from "express";
import { loginUser, userRegistration, verifyUser, refreshToken, userForgotPassword, resetUserPassword, verifyUserForgotPassword, getUser } from "../controllers/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";

const router: Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser);
router.post("/refresh-token-user", refreshToken);
router.post("/forgot-password-user", userForgotPassword);
router.post("/reset-password-user", resetUserPassword);
router.post("/verify-forgot-password-user", verifyUserForgotPassword);
router.get("/logged-in-user", isAuthenticated,getUser)

export default router;