import express, { Request, Response } from 'express';
import { Collection, ObjectId } from 'mongodb';
import { authenticate } from "../data/authMiddleware.js"; 
import { privateMessageSchema } from '../data/schema.js'; 
import { connect, db } from '../data/dbConnection.js';

const privateMessageRouter = express.Router();

privateMessageRouter.post("/", authenticate, async (req: Request, res: Response): Promise<void> => {

	//JOI validera body
	const { error } = privateMessageSchema.validate(req.body)

	if(error) {
		res.status(400).json({
			error: "Validation error",
			message: error.message
		})
	}

	try {
		await connect()
		const privateChatsCollection: Collection = db.collection("private-chats")
		const privateMessagesCollection: Collection = db.collection("private-messages")

		
        const user = (req as any).user;
		const { content, recipientId } = req.body

		if(!content || !recipientId  ) {
			res.status(400).json({ error: "Content and recipient ID are required" })
			return
		}

		const chat = await privateChatsCollection.findOne({
			participants: {
				$all: [user.userId, recipientId],
				$size: 2
			}
		})

		let chatId: ObjectId;

		if(!chat) {
			const newChat = await privateChatsCollection.insertOne({
				participants: [user.userId, recipientId],
				createdAt: new Date()
			})
			chatId = newChat.insertedId
		} else {
			chatId = chat._id
		}
		
		const newMessage = {
			chatId: chatId,
            senderId: new ObjectId(user.userId),
            senderName: user.name,
			recipientId: new ObjectId(recipientId),
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


/* This part of the code defines a route for handling GET requests to retrieve messages from a specific
private chat identified by `chatId`. Here's a breakdown of what the code does: */
privateMessageRouter.get("/chat/:chatId", authenticate, async (req: Request, res: Response) => {
    try {
        await connect()
        const privateChatsCollection: Collection = db.collection("private-chats")
		const privateMessagesCollection: Collection = db.collection("private-messages")

        const user = (req as any).user;
        const chatId = req.params.chatId;

        console.log("Looking for chat with ID:", chatId);

        const chat = await privateChatsCollection.findOne({
            _id: new ObjectId(chatId),
            participants: { $in: [user.userId] } 
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


        console.log("Found messages:", messages.length); 

        res.json(messages);

    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export { privateMessageRouter }