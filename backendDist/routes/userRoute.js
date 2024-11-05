import express from "express";
import { connect, db } from "../data/dbConnection.js";
import { validateLogin } from "../validation/validateLogin.js";
import { loginSchema, userSchema } from "../data/schema.js";
import { authenticate } from "../data/authMiddleware.js";
import jwt from 'jsonwebtoken';
import { logWithLocation } from "../helpers/betterConsoleLog.js";
const userRouter = express.Router();
/* The code snippet `userRouter.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});` is defining a middleware function in the userRouter. */
userRouter.use((req, _res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});
/* The `userRouter.get("/", authenticateJWT, async (_req: Request, res: Response): Promise<void> =>
{ ... }` function in the provided TypeScript code is defining a route handler for a GET request to
the '/all' endpoint. Here is a breakdown of what it is doing: */
userRouter.get("/", authenticate, async (_req, res) => {
    try {
        await connect();
        const userCollection = db.collection("users");
        const users = await userCollection.find({}, { projection: { password: 0 } }).toArray();
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: "Server Error", message: "An error occurred while fetching users." });
    }
});
/* The `userRouter.post('/login', async (req: Request, res: Response): Promise<void> => { ... }`
function in the provided TypeScript code is handling the POST request to the '/login' endpoint. Here
is a breakdown of what it is doing: */
userRouter.post('/login', async (req, res) => {
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
        await connect();
        const userCollection = db.collection("users");
        const user = await validateLogin(username, password, userCollection);
        if (!user) {
            res.status(401).json({ error: "Unauthorized", message: "You are not authorized to access this resource." });
            return;
        }
        const payload = {
            _id: user._id.toString(),
            name: user.name,
            isGuest: user.isGuest
        };
        const token = jwt.sign(payload, process.env.SECRET || '');
        res.json({
            jwt: token,
            user: {
                id: user._id,
                name: user.name,
                isGuest: user.isGuest
            }
        });
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: "Server Error", message: "An error occurred during login." });
    }
});
userRouter.post('/', async (req, res) => {
    const newUser = req.body;
    const { error } = userSchema.validate(newUser);
    if (error) {
        logWithLocation(`Validation error: ${error.message}`, "error");
        res.status(400);
        logWithLocation(`${res.statusCode}`, "server");
        res.status(400).json({
            message: "Invalid user data",
            error: error.message,
        });
        return;
    }
    try {
        let userCollection = db.collection("users");
        await userCollection.insertOne(newUser);
        logWithLocation(`User created successfully`, "success");
        res.status(201);
    }
    catch (error) {
        console.error('Error creating user :', error);
        res.status(500).json({ error: "Server Error", message: "An error occurred during creating user." });
    }
});
export { userRouter };
