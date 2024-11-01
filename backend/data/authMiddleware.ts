import jwt from 'jsonwebtoken';
import  { Request, Response, NextFunction } from "express";

/**
 * The `authenticate` function checks for a valid token in the request headers and verifies it using a
 * secret key before attaching the verified user to the request object.
 * @param {Request} req - The `req` parameter in the `authenticate` function stands for the request
 * object. It contains information about the HTTP request being made, such as headers, body,
 * parameters, and query strings. In this case, the function is extracting the authorization token from
 * the request headers to authenticate the user.
 * @param {Response} _res - The `_res` parameter in the `authenticate` function represents the response
 * object in Express.js. It is used to send the HTTP response back to the client with data or status
 * codes. In this function, it is not being used directly, but it is included as a parameter for
 * consistency with the typical
 * @param {NextFunction} next - The `next` parameter in the `authenticate` function is a function that
 * is called to pass control to the next middleware function in the stack. It is typically used to move
 * to the next middleware in the chain or to move to the route handler after the current middleware has
 * completed its tasks. In this
 */

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