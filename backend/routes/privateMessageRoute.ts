import express, { Request, Response } from 'express';
import { Collection, ObjectId } from 'mongodb';
import { authenticate } from "../data/authMiddleware.js"; 
import { privateMessageSchema } from '../data/schema.js'; 
import { connect, db } from '../data/dbConnection.js';

const privateMessageRouter = express.Router();

privateMessageRouter.post("/", authenticate, async (req: Request, res: Response): Promise<void> => {

	const { error } = privateMessageSchema.validate(req.body)

	if(error) {
		res.status(400).json({
			error: "Validation error",
			message: error.message
		})
		return
	}

	try {
		await connect()
		const privateChatsCollection: Collection = db.collection("private-chats")
		const privateMessagesCollection: Collection = db.collection("private-messages")
        const user = (req as any).user;
		const { content, recipientId, recipientName } = req.body

		if(!content || !recipientId  || !recipientName ) {
			res.status(400).json({ error: "Content and recipient ID  and recipient name are required" })
			return
		}

		const chat = await privateChatsCollection.findOne({
			participants: {
				$all: [user._id, recipientId],
				$size: 2
	 		}
		})

		let chatId: ObjectId;

		if(!chat) {
			const newChat = await privateChatsCollection.insertOne({
				participants: [user._id, recipientId],
				createdAt: new Date(),
				recipientName: recipientName,
				senderName: user.name
			})
			chatId = newChat.insertedId
		} else {
			chatId = chat._id
		}
		
		const newMessage = {
			chatId: chatId,
            senderId: user._id.toString(),
            senderName: user.name,
            recipientId: recipientId,
			recipientName: recipientName,
            content: content,
            createdAt: new Date()
        };
        
        const result = await privateMessagesCollection.insertOne(newMessage);
        
        res.status(201).json({
            message: "Message sent successfully",
            messageId: result.insertedId,
			chatId: chatId
        });


	} catch (error) {
		console.log("Error sending message", error);
		res.status(500).json({ error: "Internal server error"})
	}
})

privateMessageRouter.get("/chat", authenticate, async (req: Request, res: Response) => {
    try {
        await connect();
        const privateChatsCollection: Collection = db.collection("private-chats");
        const user = (req as any).user;

        // Находим все чаты, где пользователь является участником
        const chats = await privateChatsCollection.find({
            participants: { $in: [user._id] }
        }).toArray();

        console.log("Found chats for user:", chats.length);
        res.json(chats);

    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


/* This part of the code defines a route for handling GET requests to retrieve messages from a specific
private chat identified by `chatId`. Here's a breakdown of what the code does: */
privateMessageRouter.get("/chat/:chatId", authenticate, async (req: Request, res: Response) => {
    try {
        await connect()
        const privateChatsCollection: Collection = db.collection("private-chats")
		const privateMessagesCollection: Collection = db.collection("private-messages")

        const user = (req as any).user;
        const chatId = req.params.chatId;

        const chat = await privateChatsCollection.findOne({
            _id: new ObjectId(chatId),
            participants: { $in: [user._id] } 
        });

        if (!chat) {
            res.status(403).json({ 
                error: "Access denied",
                details: "User is not a participant of this chat"
            });
            return;
        }
        const messages = await privateMessagesCollection.find({
            chatId: new ObjectId(chatId)
        }).toArray();


        res.json(messages);

    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export { privateMessageRouter }