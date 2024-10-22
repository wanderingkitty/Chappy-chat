import express from "express";
import { ObjectId } from "mongodb";
import { connect, db } from "../data/dbConnection.js";
import { logWithLocation } from "../helpers/betterConsoleLog.js";
import { messageSchema } from "../data/schema.js";
import { authenticate } from "../data/authMiddleware.js";
/* The code snippet you provided is defining a middleware function called `authenticateToken` and
creating a router instance called `messageRouter` using Express. Here's a breakdown of what each
part of the code is doing: */
const messageRouter = express.Router();
/* The `messageRouter.get("/:channelId", authenticateToken, async (req: Request, res: Response):
Promise<void => { ... })` function is defining a route handler for handling GET requests to retrieve
messages for a specific channel. Here's a breakdown of what this function does: */
messageRouter.get("/:channelId", authenticate, async (req, res) => {
    logWithLocation(`GET request to messages received for channel ${req.params.channelId}`, "info");
    try {
        await connect();
        const channelsCollection = db.collection("channels");
        const messageCollection = db.collection("messages");
        const channelId = new ObjectId(req.params.channelId);
        console.log('GET channelId type:', typeof req.params.channelId, req.params.channelId);
        console.log('GET ObjectId:', channelId);
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
        console.log('Found messages:', messages); // Добавьте этот лог
        console.log('Query params:', { channelId }); // И этот
        res.json(messages);
    }
    catch (error) {
        logWithLocation(`Error fetching messages: ${error}`, "error");
        res.status(500).json({ error: "Internal server error" });
    }
});
/* The `messageRouter.post("/:channelId", authenticateToken, async (req: Request, res: Response):
Promise<void => { ... })` function is defining a route handler for handling POST requests to send a
message to a specific channel. Here's a breakdown of what this function does: */
messageRouter.post("/", authenticate, async (req, res) => {
    const { error } = messageSchema.validate(req.body);
    if (error) {
        res.status(400).json({
            error: "Validation error",
            message: error.message
        });
        return;
    }
    logWithLocation(`POST request to send a message received`, "info");
    try {
        await connect();
        const channelsCollection = db.collection("channels");
        const messagesCollection = db.collection("messages");
        const { content, channelId } = req.body;
        console.log('POST channelId type:', typeof channelId, channelId);
        console.log('POST ObjectId:', new ObjectId(channelId));
        const user = req.user;
        console.log('User in Message Route:', user);
        if (!content) {
            res.status(400).json({ error: "Message content is required" });
            return;
        }
        if (!channelId) {
            res.status(400).json({ error: "ChannelId is required" });
            return;
        }
        const channel = await channelsCollection.findOne({ _id: new ObjectId(channelId) });
        if (!channel) {
            res.status(404).json({ error: "Channel not found" });
            return;
        }
        // Проверяем, является ли канал приватным
        if (channel.isPrivate && !user) {
            res.status(401).json({ error: "Unauthorized", message: "Authentication required for private channels." });
            return;
        }
        const newMessage = {
            senderId: user ? new ObjectId(user.userId) : null,
            // Добавим лог перед использованием user.name
            senderName: user ? (() => {
                console.log("User object for name:", user); // Добавьте этот лог
                return user.name || "Unknown User"; // Добавим fallback "Unknown User"
            })() : "Guest",
            channelId: new ObjectId(channelId),
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
