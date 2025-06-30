import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

const isAuthenticated =  async (req: any, res: Response, next: NextFunction) => {
    
    try{
        const token =
        req.cookies.access_token || req.headers.authorization?.split(" ")[1];

        if (!token) {
        return res.status(401).json({ message: "Unauthorized! Token missing." });

        }
        // verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET! ) as {
            id: any;
            role: 'user' | 'admin' | 'seller';
        }

        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized! Invalid token." });   
        }

        const account =  await prisma.users.findUnique(
            { where: {id: decoded.id }});

        req.user = account;

        if (!account) {
            return res.status(401).json({ message: "Unauthorized! User not found." });
        }
        return next();

    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(500).json({ message: "Internal server error." });
}


}


export default isAuthenticated;