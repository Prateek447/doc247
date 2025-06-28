import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp } from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";

export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {   
    try {
        console.log('📝 Registration request received:', { email: req.body.email, name: req.body.name });
        
        validateRegistrationData(req.body, "user")
        const {name, email } = req.body
  
        console.log('🔍 Checking if user exists:', email);   
        const existingUser = await prisma.users.findUnique({where: { email }});
        if (existingUser) {
            console.log('❌ User already exists:', email);
            throw new ValidationError("User already exists", 400);
        }
  
        console.log('✅ User validation passed, checking OTP restrictions');
        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next);
        
        console.log('📧 Sending OTP email to:', email);
        await sendOtp(email, name, "user-activation-mail");
  
        console.log('✨ Registration successful, OTP sent to:', email);
        res.status(200).json({
            message: "OTP sent successfully. Please check your email to verify your account.",
            status: "success"
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        return next(error);
    }
}

export const verifyUser =  async (req: Request, res: Response, next: NextFunction) => {

      try {
          const { email, otp, password, name } = req.body;
          if (!email || !otp || !password || !name) {
              throw new ValidationError("All fields are required", 400);
          }

            console.log('🔍 Verifying OTP for user:', email);
            const existingUser = await prisma.users.findUnique({ where: { email } });
            if (existingUser) {
                throw new ValidationError("User already exists", 400);
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

        setCookie(res, "accessToken", accessToken);
        setCookie(res, "refreshToken", refreshToken);

        console.log('✅ User logged in successfully:', email);
        res.status(200).json({
            message: "Login successful",
            user,
            status: "success"
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        return next(error);
    }
}

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.cookies;
        
        if (!refreshToken) {
            throw new ValidationError("Refresh token is required", 401);
        }

        console.log('🔄 Refreshing token');
        
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as { id: string; role: string };
        
        if (!decoded) {
            throw new ValidationError("Invalid refresh token", 401);
        }

        // Check if user still exists
        const user = await prisma.users.findUnique({ where: { id: decoded.id } });
        if (!user) {
            throw new ValidationError("User not found", 404);
        }

        // Generate new tokens
        const newAccessToken = jwt.sign(
            { id: user.id, role: "user" },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        );

        const newRefreshToken = jwt.sign(
            { id: user.id, role: "user" },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        );

        // Set new cookies
        setCookie(res, "accessToken", newAccessToken);
        setCookie(res, "refreshToken", newRefreshToken);

        console.log('✅ Token refreshed successfully for user:', user.email);
        res.status(200).json({
            message: "Token refreshed successfully",
            status: "success"
        });
    } catch (error) {
        console.error('❌ Token refresh error:', error);
        return next(error);
    }
}

export const userForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            throw new ValidationError("Email is required", 400);
        }

        console.log('🔍 Checking if user exists for password reset:', email);
        
        // Check if user exists
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
            throw new ValidationError("User not found", 404);
        }

        // Check OTP restrictions
        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next);

        console.log('📧 Sending password reset OTP to:', email);
        await sendOtp(email, user.name, "password-reset-mail"); // Using password reset template

        console.log('✅ Password reset OTP sent to:', email);
        res.status(200).json({
            message: "Password reset OTP sent successfully. Please check your email.",
            status: "success"
        });
    } catch (error) {
        console.error('❌ Forgot password error:', error);
        return next(error);
    }
}

export const verifyForgotpasswordOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            throw new ValidationError("Email and OTP are required", 400);
        }

        console.log('🔍 Verifying password reset OTP for:', email);
        
        // Check if user exists
        const user = await prisma.users.findUnique({ where: { email } });
        if (!user) {
            throw new ValidationError("User not found", 404);
        }

        // Verify OTP
        await verifyOtp(email, otp, next);

        // Generate a temporary token for password reset (valid for 10 minutes)
        const resetToken = jwt.sign(
            { id: user.id, email: user.email, type: "password_reset" },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "10m" }
        );

        console.log('✅ Password reset OTP verified for:', email);
        res.status(200).json({
            message: "OTP verified successfully. You can now reset your password.",
            resetToken,
            status: "success"
        });
    } catch (error) {
        console.error('❌ Verify forgot password OTP error:', error);
        return next(error);
    }
}

export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { resetToken, newPassword } = req.body;
        
        if (!resetToken || !newPassword) {
            throw new ValidationError("Reset token and new password are required", 400);
        }

        if (newPassword.length < 6) {
            throw new ValidationError("Password must be at least 6 characters long", 400);
        }

        console.log('🔍 Verifying reset token and updating password');
        
        // Verify the reset token
        const decoded = jwt.verify(resetToken, process.env.ACCESS_TOKEN_SECRET as string) as {
            id: string;
            email: string;
            type: string;
        };

        if (!decoded || decoded.type !== "password_reset") {
            throw new ValidationError("Invalid or expired reset token", 401);
        }

        // Check if user exists
        const user = await prisma.users.findUnique({ where: { id: decoded.id } });
        if (!user) {
            throw new ValidationError("User not found", 404);
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        await prisma.users.update({
            where: { id: decoded.id },
            data: { password: hashedPassword }
        });

        console.log('✅ Password reset successfully for:', user.email);
        res.status(200).json({
            message: "Password reset successfully",
            status: "success"
        });
    } catch (error) {
        console.error('❌ Reset password error:', error);
        return next(error);
    }
}