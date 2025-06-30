import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgotpasswordOtp, verifyOtp } from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";

/**
 * @swagger
 * /api/user-registration:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user by sending OTP to their email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password (minimum 6 characters)
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP sent successfully. Please check your email to verify your account."
 *                 status:
 *                   type: string
 *                   example: "success"
 *       400:
 *         description: Bad request - validation error
 *       409:
 *         description: User already exists
 */
export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {   
    try {
        console.log('📝 Registration request received:', { email: req.body.email, name: req.body.name });
        
        validateRegistrationData(req.body, "user")
        const {name, email } = req.body
  
        const existingUser = await prisma.users.findUnique({where: { email }});
        if (existingUser) {
            console.log('❌ User already exists:', email);
            throw new ValidationError("User already exists", 400);
        }
        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next);
        
        await sendOtp(email, name, "user-activation-mail");
  
        res.status(200).json({
            message: "OTP sent successfully. Please check your email to verify your account.",
            status: "success"
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        return next(error);
    }
}

/**
 * @swagger
 * /api/verify-user:
 *   post:
 *     summary: Verify user OTP and complete registration
 *     description: Verify the OTP sent to user's email and complete the registration process
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - otp
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password (minimum 6 characters)
 *                 example: "password123"
 *               otp:
 *                 type: string
 *                 description: 4-digit OTP received via email
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                 status:
 *                   type: string
 *                   example: "success"
 *       400:
 *         description: Bad request - validation error or user already exists
 *       401:
 *         description: Invalid OTP
 */
export const verifyUser =  async (req: Request, res: Response, next: NextFunction) => {

      try {
          const { email, otp, password, name } = req.body;
          if (!email || !otp || !password || !name) {
              throw new ValidationError("All fields are required", 400);
          }

            console.log('🔍 Verifying OTP for user:', email);
            const existingUser = await prisma.users.findUnique({ where: { email } });
            if (existingUser) {
                throw new ValidationError("User already exists with this email", 400);
            }
            await verifyOtp(email, otp, next);
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.users.create({ 
                data: {
                    email,
                    password: hashedPassword,
                    name,
                }
            });
            console.log('✅ OTP verified successfully for:', email);
            res.status(200).json({
                message: "User registered successfully",
                user,
                status: "success"
            });
        
      } catch (error) {
        console.error('❌ Verification error:', error);
        return next(error);
      }

}

/**
 * @swagger
 * /api/login-user:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                 status:
 *                   type: string
 *                   example: "success"
 *         headers:
 *           Set-Cookie:
 *             description: Access and refresh tokens set as HTTP-only cookies
 *       400:
 *         description: Bad request - missing email or password
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new ValidationError("Email and password are required", 400);
        }

        console.log('🔍 Checking user credentials for:', email);
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
            throw new ValidationError("User not found", 404);
        }

        if (!user.password) {
            throw new ValidationError("Password is not set for this user", 400);
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new ValidationError("Invalid password", 401);
        }

        const accessToken = jwt.sign({id: user.id, role: "user"},process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });

        const refreshToken = jwt.sign({id: user.id, role: "user"}, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });

        setCookie(res, "access_token", accessToken);
        setCookie(res, "refresh_token", refreshToken);

        console.log('✅ User logged in successfully:', email);
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            status: "success"
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        return next(error);
    }
}

/**
 * @swagger
 * /api/refresh-token-user:
 *   post:
 *     summary: Refresh access token
 *     description: Refresh the access token using the refresh token from cookies
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token refreshed successfully"
 *                 status:
 *                   type: string
 *                   example: "success"
 *         headers:
 *           Set-Cookie:
 *             description: New access and refresh tokens set as HTTP-only cookies
 *       401:
 *         description: Invalid or missing refresh token
 *       404:
 *         description: User not found
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.cookies;
        
        if (!refreshToken) {
            throw new ValidationError("Refresh token is required", 401);
        }
        
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as { id: string; role: string };
        
        if (!decoded || !decoded.id || !decoded.role) {
            throw new JsonWebTokenError("Forbidden! Invalid refresh token");
        }

        // Check if user still exists
        const user = await prisma.users.findUnique({ where: { id: decoded.id } });
        if (!user) {
            throw new ValidationError("User not found", 404);
        }

        // Generate new tokens
        const newAccessToken = jwt.sign(
            { id: decoded.id, role: decoded.role },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        );

        // const newRefreshToken = jwt.sign(
        //     { id: user.id, role: "user" },
        //     process.env.REFRESH_TOKEN_SECRET as string,
        //     { expiresIn: "7d" }
        // );

        // Set new cookies
        setCookie(res, "access_token", newAccessToken);
        // setCookie(res, "refreshToken", newRefreshToken);
        res.status(200).json({
            message: "Token refreshed successfully",
            status: "success"
        });
    } catch (error) {
        console.error('❌ Token refresh error:', error);
        return next(error);
    }
}

/**
 * @swagger
 * /api/forgot-password-user:
 *   post:
 *     summary: Send password reset OTP
 *     description: Send a password reset OTP to the user's email address
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: Password reset OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset OTP sent successfully. Please check your email."
 *                 status:
 *                   type: string
 *                   example: "success"
 *       400:
 *         description: Bad request - email is required
 *       404:
 *         description: User not found
 */
export const userForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await handleForgotPassword(req, res, next, "User");
}

/**
 * @swagger
 * /api/verify-forgot-password-user:
 *   post:
 *     summary: Verify password reset OTP
 *     description: Verify the OTP sent for password reset and return a reset token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john@example.com"
 *               otp:
 *                 type: string
 *                 description: 4-digit OTP received via email
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP verified successfully"
 *                 resetToken:
 *                   type: string
 *                   description: Token to be used for password reset
 *                 status:
 *                   type: string
 *                   example: "success"
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Invalid OTP
 *       404:
 *         description: User not found
 */
export const verifyUserForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
   await verifyForgotpasswordOtp(req, res, next);
}

/**
 * @swagger
 * /api/reset-password-user:
 *   post:
 *     summary: Reset user password
 *     description: Reset user password using the reset token from OTP verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - resetToken
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john@example.com"
 *               resetToken:
 *                 type: string
 *                 description: Reset token received from OTP verification
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password (minimum 6 characters)
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully"
 *                 status:
 *                   type: string
 *                   example: "success"
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Invalid reset token
 *       404:
 *         description: User not found
 */
export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, newPassword } = req.body;
        
        if (!email || !newPassword) {
            throw new ValidationError("Reset token and new password are required", 400);
        }

        if (newPassword.length < 6) {
            throw new ValidationError("Password must be at least 6 characters long", 400);
        }
        
        // Check if user exists
        const user = await prisma.users.findUnique({ where: { email } });

        if (!user) {
            throw new ValidationError("User not found", 404);
        }

        const isSamePassword =  await bcrypt.compare(newPassword, user.password!)

        if (isSamePassword) {
            throw new ValidationError("New password cannot be the same as the old password", 400);
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        await prisma.users.update({
            where: { email},
            data: { password: hashedPassword }
        });
        res.status(200).json({
            message: "Password reset successfully",
            status: "success"
        });
    } catch (error) {
        console.error('❌ Reset password error:', error);
        return next(error);
    }
}

export const getUser = async (req: any, res: Response, next: NextFunction) => {
    try {
    const user = req.user; // Assuming user is set by isAuthenticated middleware
    res.status(200).json({
        success: true,
        user,
    })
    } catch (error) {
        next(error);
    }
}