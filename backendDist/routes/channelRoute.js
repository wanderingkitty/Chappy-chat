import express from "express";
import { connect, db } from "../data/dbConnection.js";
const channelRouter = express.Router();
/* The `channelRouter.get("/", async (req: Request, res: Response) => { ... }` function is handling the
GET request to retrieve channels. Here's a breakdown of what it does: */
channelRouter.get("/", async (req, res) => {
    if (!process.env.SECRET) {
        console.log("SECRET is not defined");
        res.sendStatus(500);
        return;
    }
    let token = req.headers.authorization;
    try {
        await connect();
        const channelsCollection = db.collection("channels");
        if (!token) {
            console.log("No token provided, returning public channels");
            const publicChannels = await channelsCollection.find({ isPrivate: false }).toArray();
            res.json(publicChannels);
            return;
        }
        try {
        }
        catch (error) {
            console.log("Token verification failed", error);
            res.sendStatus(400); // bad request
            return;
        }
        const allChannels = await channelsCollection.find({}).toArray();
        res.json(allChannels);
    }
    catch (error) {
        console.error("Error fetching channels:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
/* The `channelRouter.post("/", async (req: Request, res: Response) => { ... }` function is handling
the POST request to create a new channel. Here's a breakdown of what it does: */
channelRouter.post("/", async (req, res) => {
    try {
        await connect();
        const channelsCollection = db.collection("channels");
        const newChannel = {
            name: req.body.name,
            channelId: req.body.channelId,
            members: [],
            isPrivate: false,
            parentChannel: "Coding"
        };
        const result = await channelsCollection.insertOne(newChannel);
        res.status(201).json({ _id: result.insertedId, ...newChannel });
    }
    catch (error) {
        console.error("Error creating channel:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
export { channelRouter };
