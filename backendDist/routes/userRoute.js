import express from "express";
import { connect } from "../data/dbConnection.js";
import jwt from 'jsonwebtoken';
import { validateLogin } from "../validation/validateLogin.js";
const userRouter = express.Router();
userRouter.use((req, _res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});
userRouter.get("/", async (_req, res) => {
    res.json({ message: "This will return all users in the future" });
});
userRouter.post('/login', (req, res) => {
    const { username, password } = req.body;
    connect().then((collection) => {
        return validateLogin(username, password, collection);
    }).then((user) => {
        if (!user) {
            res.status(401).json({ error: "Unauthorized", message: "You are not authorized to access this resource." });
            return;
        }
        // Create JWT
        const payload = { userId: user._id.toString() };
        const token = jwt.sign(payload, process.env.SECRET || '');
        res.json({ jwt: token });
    }).catch((error) => {
        console.error('Error during login:', error);
        res.status(500).json({ error: "Server Error", message: "An error occurred during login." });
    });
});
export { userRouter };
