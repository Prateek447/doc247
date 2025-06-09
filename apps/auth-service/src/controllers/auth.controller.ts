import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp } from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";

export const userRegisteration = async (req: Request, res: Response, next: NextFunction) => {   
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