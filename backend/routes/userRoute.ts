import express, { Router, Request, Response, NextFunction } from "express";
import { Collection } from "mongodb";
import { connect } from "../data/dbConnection.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/interfaces/user.js";
import { validateLogin } from "../validation/validateLogin.js";

const userRouter: Router = express.Router();

userRouter.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});

userRouter.get("/", (req: Request, res: Response) => {
    res.json({ message: "This will return all users in the future" });
});

userRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;
    
    try {
        const collection: Collection<User> = await connect();
        const user = await validateLogin(username, password, collection);

        if (!user) {
            res.status(401).json({ error: "Unauthorized", message: "You are not authorized to access this resource." });
            return;
        }

        // Create JWT
        const payload = { 
            userId: user._id.toString(),
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