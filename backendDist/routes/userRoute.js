import express from "express";
import { ObjectId } from "mongodb";
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
userRouter.post('/signup', async (req, res) => {
    const { error } = userSchema.validate(req.body);
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
    const { name, password } = req.body;
    try {
        await connect();
        const userCollection = db.collection("users");
        const existingUser = await userCollection.findOne({ name });
        if (existingUser) {
            res.status(400).json({
                error: "User exists",
                message: "Username already taken"
            });
            return;
        }
        const newUser = {
            _id: new ObjectId(),
            userId: new ObjectId().toString(),
            name,
            password,
            isGuest: false
        };
        const result = await userCollection.insertOne(newUser);
        const payload = {
            _id: result.insertedId.toString(),
            name: newUser.name,
            isGuest: newUser.isGuest
        };
        const token = jwt.sign(payload, process.env.SECRET || '');
        res.json({
            jwt: token,
            user: {
                id: result.insertedId,
                name: newUser.name,
                isGuest: newUser.isGuest
            }
        });
    }
    catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({
            error: "Server Error",
            message: "An error occurred during signup."
        });
    }
});
export { userRouter };
