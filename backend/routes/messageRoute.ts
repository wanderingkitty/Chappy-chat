import express, { Router, Request, Response} from "express";
import { Collection, ObjectId } from "mongodb";
import { connect, db } from "../data/dbConnection.js";
import { logWithLocation } from "../helpers/betterConsoleLog.js";
import { messageSchema } from "../data/schema.js"; 
import { authenticate } from "../data/authMiddleware.js"; 


const messageRouter: Router = express.Router();

messageRouter.get("/:channelId", authenticate, async (req: Request, res: Response): Promise<void> => {
    
    logWithLocation(`GET request to messages received for channel ${req.params.channelId}`, "info");

    try {
        await connect();
        const channelsCollection: Collection = db.collection("channels");
        const messageCollection: Collection = db.collection("messages");

        const channelId = new ObjectId(req.params.channelId);
        const channel = await channelsCollection.findOne({ _id: channelId });

        if (!channel) {
            res.status(404).json({error: "Channel not found"});
            return;
        }

        if (channel.isPrivate && !(req as any).user) {
            res.status(403).json({error: "Authentication required for private channels"});
            return;
        }

        const messages = await messageCollection.find({ channelId: channelId }).toArray();
        
        res.json(messages);

    } catch (error) {
        logWithLocation(`Error fetching messages: ${error}`, "error");
        res.status(500).json({ error: "Internal server error" });
    }
});

messageRouter.post("/", authenticate, async (req: Request, res: Response): Promise<void> => {
    const { error } = messageSchema.validate(req.body)

    if(error) {
        res.status(400).json({
            error: "Validation error",
            message: error.message
        })
        return
    }

    try {
        await connect();
        const channelsCollection: Collection = db.collection("channels");
        const messagesCollection: Collection = db.collection("messages");
        
        const { content, channelId } = req.body;
        const user = (req as any).user;
        
        if (!content || !channelId) {
            res.status(400).json({ error: "Content and channel ID are required" });
            return;
        }

        const channel = await channelsCollection.findOne({ _id: new ObjectId(channelId) });
        if (!channel) {
            res.status(404).json({ error: "Channel not found" });
            return;
        }

        // Проверяем, является ли канал приватным
        if (channel.isPrivate && !user) {
            res.status(403).json({error: "Authentication required for private channels"});
            return;
        }

        // Создаем сообщение с учетом гостевого доступа
        const newMessage = {
            senderId: user ? user._id : 'guest',
            senderName: user ? user.name : "Guest",
            channelId: new ObjectId(channelId),
            content: content,
            createdAt: new Date()
        };
        
        const result = await messagesCollection.insertOne(newMessage);
        
        res.status(201).json({
            message: "Message sent successfully",
            messageId: result.insertedId
        });
    } catch (error) {
        logWithLocation(`Error sending message: ${error}`, "error");
        res.status(500).json({ error: "Internal server error" });
    }
});

export { messageRouter };