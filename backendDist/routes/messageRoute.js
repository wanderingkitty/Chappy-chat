import express from "express";
import { ObjectId } from "mongodb";
import { connect, db } from "../data/dbConnection.js";
import { logWithLocation } from "../helpers/betterConsoleLog.js";
import jwt from 'jsonwebtoken';
const messageRouter = express.Router();
const authenticateToken = (req, _res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Получаем токен из заголовка
    if (token && process.env.SECRET) {
        jwt.verify(token, process.env.SECRET, (err, user) => {
            if (!err) {
                req.user = user;
            }
        });
    }
    next();
};
messageRouter.get("/:channelId", authenticateToken, async (req, res) => {
    logWithLocation(`GET request to messages received for channel ${req.params.channelId}`, "info");
    try {
        await connect();
        const channelsCollection = db.collection("channels");
        const messageCollection = db.collection("messages");
        const channelId = new ObjectId(req.params.channelId);
        const channel = await channelsCollection.findOne({ _id: channelId });
        if (!channel) {
            res.status(404).json({ error: "Channel not found" });
            return;
        }
        // Проверяем, открытый ли канал и аутентифицирован ли пользователь
        if (channel.isPrivate && !req.user) {
            res.status(403).json({ error: "Authentication required for private channels" });
            return;
        }
        const messages = await messageCollection.find({ channelId: channelId }).toArray();
        res.json(messages);
    }
    catch (error) {
        logWithLocation(`Error fetching messages: ${error}`, "error");
        res.status(500).json({ error: "Internal server error" });
    }
});
messageRouter.post("/:channelId", authenticateToken, async (req, res) => {
    logWithLocation(`POST request to send a message received`, "info");
    try {
        await connect();
        const channelsCollection = db.collection("channels");
        const messagesCollection = db.collection("messages");
        const { content } = req.body;
        const channelId = new ObjectId(req.params.channelId);
        if (!content) {
            res.status(400).json({ error: "Message content is required" });
            return;
        }
        // Проверяем существование канала
        const channel = await channelsCollection.findOne({ _id: channelId });
        if (!channel) {
            res.status(404).json({ error: "Channel not found" });
            return;
        }
        const newMessage = {
            senderId: new ObjectId(req.user.userId),
            channelId: channelId,
            content: content,
            createdAt: new Date()
        };
        logWithLocation(`Attempting to insert message: ${JSON.stringify(newMessage)}`, "info");
        const result = await messagesCollection.insertOne(newMessage);
        logWithLocation(`Message inserted with ID: ${result.insertedId}`, "info");
        res.status(201).json({
            message: "Message sent successfully",
            messageId: result.insertedId
        });
    }
    catch (error) {
        logWithLocation(`Error sending message: ${error}`, "error");
        res.status(500).json({ error: "Internal server error" });
    }
});
export { messageRouter };
