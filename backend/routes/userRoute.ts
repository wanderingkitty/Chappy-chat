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


userRouter.get("/", async (_req: Request, res: Response) => {
    res.json({ message: "This will return all users in the future" });
});

/* This code snippet defines a POST route at '/login' on the userRouter. When a POST request is made to
this route, it expects the request body to contain a username and password. It then connects to the
database, retrieves a collection of users, and validates the login credentials using the
validateLogin function. */
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