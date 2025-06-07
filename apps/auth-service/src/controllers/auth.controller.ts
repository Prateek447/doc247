import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData } from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { ValidationError } from "@packages/error-handler";

export const userRegisteration = async (req: Request, res: Response, next: NextFunction) => {   
    try {
        console.log('📝 Registration request received:', { email: req.body.email, name: req.body.name });
        
        validateRegistrationData(req.body, "user")
        const {name, email } = req.body
  
        console.log('🔍 Checking if user exists:', email);   
        const existingUser = await prisma.users.findUnique({where: { email }});
        if (existingUser) {
            console.log('❌ User already exists:', email);
            return next(new ValidationError("User already exists", 400));
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