import express, { Router, Request, Response} from "express";
import { Collection, ObjectId } from "mongodb";
import { connect, db } from "../data/dbConnection.js";
import { logWithLocation } from "../helpers/betterConsoleLog.js";
import { messageSchema } from "../data/schema.js"; 
import { authenticate } from "../data/authMiddleware.js"; 

/* The code snippet you provided is defining a middleware function called `authenticateToken` and
creating a router instance called `messageRouter` using Express. Here's a breakdown of what each
part of the code is doing: */
const messageRouter: Router = express.Router();

/* The `messageRouter.get("/:channelId", authenticateToken, async (req: Request, res: Response):
Promise<void => { ... })` function is defining a route handler for handling GET requests to retrieve
messages for a specific channel. Here's a breakdown of what this function does: */
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

/* This code snippet is checking if the channel is marked as private (`channel.isPrivate`) and
if the user is not authenticated (`!(req as any).user`). If both conditions are met, it means
that authentication is required to access this private channel. In that case, the code
responds with a 403 status code (Forbidden) and sends a JSON response indicating that
authentication is required for private channels. Finally, the `return;` statement is used to
exit the function early if this condition is met, preventing further execution of the code
block. */
        if (channel.isPrivate && !(req as any).user) {
            res.status(403).json({error: "Authentication required for private channels"});
            return;
        }

/* The code snippet `const messages = await messageCollection.find({ channelId: channelId
}).toArray();` is querying the `messageCollection` to find all messages that belong to a specific
channel identified by the `channelId`. It uses the `find` method with a filter object to specify
that only messages with the matching `channelId` should be retrieved. */
        const messages = await messageCollection.find({ channelId: channelId }).toArray();
        
        res.json(messages);

    } catch (error) {
        logWithLocation(`Error fetching messages: ${error}`, "error");
        res.status(500).json({ error: "Internal server error" });
    }
});

/* The `messageRouter.post("/:channelId", authenticateToken, async (req: Request, res: Response):
Promise<void => { ... })` function is defining a route handler for handling POST requests to send a
message to a specific channel. Here's a breakdown of what this function does: */
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

        if (channel.isPrivate && !(req as any).user) {
            res.status(403).json({error: "Authentication required for private channels"});
            return;
        }

        const newMessage = {
            senderId: user._id,
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