import { NextFunction } from "express";
import { ValidationError } from "../../../../packages/error-handler";
import redis from "../../../../packages/libs/redis";
import { sendEmail } from "./sendEmail";




const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (data: any, userType: "seller" | "user") => {
    const { email, password, name, phone_number, country } = data;
    
    if (!email || !password || !name || ( userType === "seller" && (!country || !phone_number ))) {
        return new ValidationError("All fields are required");
    }
    
    if (!emailRegex.test(email)) {
        return new ValidationError("Invalid email format");
    }
}


export const checkOtpRestrictions =  async (email: string, next: NextFunction) => {
    if(await redis.get(`otp_lock: ${email}`)) {
        return next(new ValidationError("You have reached the maximum number of OTP requests. Please try again later.", 429));
    }
        if(await redis.get(`otp_spam_lock:${email}`)) {
            return next(new ValidationError("You have requested too many OTPs in a short period. Please try again later.", 429));
        }

        if(await redis.get(`otp_cooldown:${email}`)) {
            return next(new ValidationError("Please wait 1 minute before requesting new otp!", 429));
        }
}

export const trackOtpRequests =  async (email: string, next: NextFunction) => {
    const otpRequestKey =  `otp_request_count:${email}`;
    let  otpRequests = parseInt(await redis.get(otpRequestKey) || "0");
    if (otpRequests >= 5) {
        await redis.set(`otp_lock:${email}`, "true", "EX", 3600); // Lock for 1 hour
        return next(new ValidationError("You have reached the maximum number of OTP requests. Please try again later.", 429));
    }

    // await redis.incr(otpRequestKey);
    await redis.set(otpRequestKey, (otpRequests + 1).toString(), "EX", 3600); // Increment count and set expiration to 1 hour
}

export const sendOtp = async (email: string, name: string, template: string) =>{
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await sendEmail(email, "Verify Your Email", template, { name, otp });
    await redis.set(`otp:${email}`, otp, "EX", 300); // Store OTP for 5 minutes
    await redis.set(`otp_cooldown:${email}`, "true", "EX", 60); // Set cooldown for 1 minute
}