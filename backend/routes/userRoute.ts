import express, { Router, Request, Response, NextFunction } from "express";
import { Collection } from "mongodb";
import { db, connect } from "../data/dbConnection.js";
import { logWithLocation } from "../helpers/betterConsoleLog.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/interfaces/user.js";
import { validateLogin } from "../validation/validateLogin.js";

const userRouter: Router = express.Router();
let collection: Collection<User>;

userRouter.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    collection = db.collection<User>("users");
    next();
});

// Тестовый маршрут в userRouter
userRouter.get('/test', (req: Request, res: Response) => {
    res.json({ message: "User router is working" });
});

userRouter.get("/", async (req: Request, res: Response) => {
    res.json({ message: "This will return all users in the future" });
});

userRouter.post('/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    connect().then((collection: Collection<User>) => {
        return validateLogin(username, password, collection);
    }).then((user: User | null) => {
        if (!user) {
            res.status(401).json({ error: "Unauthorized", message: "You are not authorized to access this resource." });
            return;
        }

        // Create JWT
        const payload = { userId: user._id.toString() };
        const token: string = jwt.sign(payload, process.env.SECRET || '');
        res.json({ jwt: token });
    }).catch((error: any) => {
        console.error('Error during login:', error);
        res.status(500).json({ error: "Server Error", message: "An error occurred during login." });
    });
});

export { userRouter };