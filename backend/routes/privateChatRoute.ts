import express, { Request, Response } from 'express';
import { Collection } from 'mongodb';
import { authenticate } from "../data/authMiddleware.js"; 
import { connect, db } from '../data/dbConnection.js';


const privateChatRoute = express.Router();

privateChatRoute.post("/chat", authenticate, async (req: Request, res: Response): Promise<void> => {

    try {
        await connect();
        const privateChatsCollection: Collection = db.collection("private-chats");
        const user = (req as any).user;
        const { recipientId, recipientName } = req.body;

        if (!recipientId || !recipientName) {
            res.status(400).json({ error: "Recipient ID and name are required" });
            return;
        }

        // Check if a chat already exists with the same participants
        const existingChat = await privateChatsCollection.findOne({
            participants: {
                $all: [user._id, recipientId],
                $size: 2
            }
        });

        if (existingChat) {
            res.status(200).json(existingChat);
            return;
        }

        // Create new chat if it doesn't exist
        const newChat = {
            participants: [user._id, recipientId],
            recipientName,
            senderName: user.name,
            isPrivate: true
        };

        const result = await privateChatsCollection.insertOne(newChat);

        res.status(201).json({
            _id: result.insertedId,
            ...newChat
        });

    } catch (error) {
        console.error("Error creating chat:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


export default privateChatRoute;
