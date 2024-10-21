import express from "express";
import { connect } from "../data/dbConnection.js";
import jwt from 'jsonwebtoken';
import { validateLogin } from "../validation/validateLogin.js";
const userRouter = express.Router();
userRouter.use((req, _res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});
const authenticateJWT = (req, _res, next) => {
    // Получаем токен напрямую из заголовка
    const token = req.headers.authorization;
    if (token && process.env.SECRET) {
        try {
            // Верифицируем токен
            const verifiedUser = jwt.verify(token, process.env.SECRET);
            // Если верификация успешна, добавляем информацию о пользователе к запросу
            req.user = verifiedUser;
        }
        catch (error) {
            // Если токен недействителен, просто продолжаем без установки пользователя
            console.log('Invalid token:', error);
        }
    }
    // Продолжаем обработку запроса в любом случае
    next();
};
userRouter.get("/all", authenticateJWT, async (_req, res) => {
    try {
        const collection = await connect();
        const users = await collection.find({}, { projection: { password: 0 } }).toArray();
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: "Server Error", message: "An error occurred while fetching users." });
    }
});
userRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const collection = await connect();
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
export { userRouter };
