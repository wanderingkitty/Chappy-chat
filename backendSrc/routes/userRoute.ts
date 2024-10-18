import { Router, Request, Response } from "express"; 
import { Collection } from "mongodb"; 
import { db } from "../data/dbConnection.js"; 
import { User } from "../models/interfaces/user.js"; 
import { getAllUsers } from "../models/users/getAllUsers.js"; 
import { validateLogin } from "../validation/validateLogin.js"; 
import { logWithLocation } from "../helpers/betterConsoleLog.js";

const userRouter = Router();
let collection: Collection<User>;

userRouter.use((req: Request, res: Response, next) => {
	console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    collection = db.collection<User>("users");
    next();
});

userRouter.get("/", async (req: Request, res: Response) => {
    await getAllUsers(req, res, collection);
});

userRouter.post("/login", async (req: Request, res: Response) => {
    logWithLocation("Received login request with body:", req.body);
    const { name, password } = req.body;

    try {
        const user = await validateLogin(name, password, collection);
        if (user) {
            res.status(200).json({ message: "Login successful", userId: user._id });
        } else {
            res.status(401).json({ message: "Invalid username or password" });
        }
    } catch (error: any) {
        res.status(500).json({ message: "Error during login", error: error.message });
    }
});

export { userRouter };
