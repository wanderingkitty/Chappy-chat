import express, { Router, Request, Response, NextFunction } from "express";
import { Collection } from "mongodb";
import { connect } from "../data/dbConnection.js";
import { User } from "../models/user.js";
import { validateLogin } from "../validation/validateLogin.js";
import { loginSchema } from "../data/schema.js"; 
import { authenticate } from "../data/authMiddleware.js"; 
import jwt from 'jsonwebtoken';

const userRouter: Router = express.Router();

/* The code snippet `userRouter.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});` is defining a middleware function in the userRouter. */
userRouter.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});

/**
 * The function `authenticateJWT` extracts a token from the request header, verifies it using a secret
 * key, and attaches user information to the request if the token is valid.
 * @param {Request} req - The `req` parameter in the `authenticateJWT` function stands for the request
 * object. It contains information about the HTTP request being made, such as the headers, body,
 * parameters, and more. In this specific function, the `req` parameter is used to extract the JWT
 * token from the request
 * @param {Response} _res - The `_res` parameter in the `authenticateJWT` function represents the
 * response object in Express.js. It is typically used to send responses back to the client making the
 * request. In this function, it is passed as an argument but not used within the function itself. It
 * is common to see it included
 * @param {NextFunction} next - The `next` parameter in the `authenticateJWT` function is a callback
 * function that is passed to middleware functions in Express. When called, it passes control to the
 * next middleware function in the stack. This allows you to chain multiple middleware functions
 * together to handle a request in a modular way. In the
 */


/* The `userRouter.get("/all", authenticateJWT, async (_req: Request, res: Response): Promise<void> =>
{ ... }` function in the provided TypeScript code is defining a route handler for a GET request to
the '/all' endpoint. Here is a breakdown of what it is doing: */
userRouter.get("/all", authenticate, async (_req: Request, res: Response): Promise<void> => {
    try {
        const collection: Collection<User> = await connect();
        const users = await collection.find({}, { projection: { password: 0 } }).toArray();
        
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: "Server Error", message: "An error occurred while fetching users." });
    }
});


/* The `userRouter.post('/login', async (req: Request, res: Response): Promise<void> => { ... }`
function in the provided TypeScript code is handling the POST request to the '/login' endpoint. Here
is a breakdown of what it is doing: */
userRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { error } = loginSchema.validate(req.body);

    if (error) {
        res.status(400).json({
            error: "Validation error",
            message: error.message
        });
        return;
    }

    const { username, password } = req.body;

    try {
        const collection: Collection<User> = await connect();
        const user = await validateLogin(username, password, collection);

        if (!user) {
            res.status(401).json({ error: "Unauthorized", message: "You are not authorized to access this resource." });
            return;
        }

        console.log('User object:', user);

        // Create JWT
        const payload = {
            userId: user._id.toString(),
            name: user.name,
            isGuest: user.isGuest
        };

        const token: string = jwt.sign(payload, process.env.SECRET || '');

        res.json({
            jwt: token,
            user: {
                id: user._id,
                name: user.name,
                isGuest: user.isGuest
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: "Server Error", message: "An error occurred during login." });
    }
});

export { userRouter };