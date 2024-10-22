import jwt from 'jsonwebtoken';
import  { Request, Response, NextFunction } from "express";


export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (token && process.env.SECRET) {
        try {
            const verifiedUser = jwt.verify(token, process.env.SECRET);
            console.log('Verified User:', verifiedUser);
            (req as any).user = verifiedUser;
        } catch (error) {
            console.log('Invalid token:', error);
        }
    }
    next();
};