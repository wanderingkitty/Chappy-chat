import express, { Router, Request, Response} from "express";
import { Collection, ObjectId } from "mongodb";
import { connect, db } from "../data/dbConnection.js";
import { authenticate } from "../data/authMiddleware.js"; 

const messageRouter: Router = express.Router();

messageRouter.get("/:channelId", authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        await connect();
        const messageCollection: Collection = db.collection("messages");
        const channelsCollection: Collection = db.collection("channels");

        const channelObjectId = new ObjectId(req.params.channelId);
        
        const channel = await channelsCollection.findOne({ 
            _id: channelObjectId
        });
        
        if (!channel) {
            console.log("Channel not found");
            res.status(404).json({error: "Channel not found"});
            return;
        }

        const messages = await messageCollection
            .find({ 
                channelId: channelObjectId  
            })
            .sort({ createdAt: 1 })
            .toArray();
                
        res.json(messages);

    } catch (error) {
        console.error("Ошибка при получении сообщений:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

messageRouter.post("/", authenticate, async (req: Request, res: Response): Promise<void> => {

    try {
        await connect();
        const messagesCollection: Collection = db.collection("messages");
        const channelsCollection: Collection = db.collection("channels");
        
        const { content, channelId } = req.body;
        const user = (req as any).user;
        
        if (!content || !channelId) {
            res.status(400).json({ error: "Content and channel ID are required" });
            return;
        }

        const channelObjectId = new ObjectId(channelId);
        
        const channel = await channelsCollection.findOne({ 
            _id: channelObjectId
        });

        if (!channel) {
            res.status(404).json({ error: "Channel not found" });
            return;
        }

        const newMessage = {
            senderId: user ? user._id : 'guest',
            senderName: user ? user.name : "Guest",
            channelId: channelObjectId,  
            content: content,
            createdAt: new Date()
        };
                
        const result = await messagesCollection.insertOne(newMessage);
        
        const savedMessage = await messagesCollection.findOne({ 
            _id: result.insertedId 
        });
        
        res.status(201).json(savedMessage);

    } catch (error) {
        console.error("Ошибка при создании сообщения:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export { messageRouter };