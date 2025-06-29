import { Response } from 'express';


export const setCookie = (res: Response, name: string, value: string) => {
    const cookieOptions: { [key: string]: any } = {
        httpOnly: true,
        secure: true, // Use secure cookies in production
        sameSite: 'none', // Adjust as necessary
        maxAge: 7 * 24 * 60 * 60 * 1000 // 1 day in milliseconds
    };

    res.cookie(name, value, cookieOptions);
}