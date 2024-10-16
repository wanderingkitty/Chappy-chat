import express from "express";
import { db, connect } from "../data/dbConnection.js";
import jwt from 'jsonwebtoken';
import { validateLogin } from "../validation/validateLogin.js";
const userRouter = express.Router();
let collection;
userRouter.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    collection = db.collection("users");
    next();
});
// Тестовый маршрут в userRouter
userRouter.get('/test', (req, res) => {
    res.json({ message: "User router is working" });
});
// Get all users (can be protected with JWT in the future)
userRouter.get("/", async (req, res) => {
    // Implement the function to get all users
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
