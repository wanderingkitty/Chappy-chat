import express, { Router, Request, Response } from "express";
import { Collection, WithId } from "mongodb";
import { connect, db } from "../data/dbConnection.js";
import { Channel } from "../models/channels.js";

const channelRouter: Router = express.Router();



channelRouter.get("/", async (req: Request, res: Response) => {

    if (!process.env.SECRET) {
        console.log("SECRET is not defined"); 
        res.sendStatus(500);
        return;
    }

    let token = req.headers.authorization;

    try {
        await connect();
        const channelsCollection: Collection<Channel> = db.collection("channels");
        
        if (!token) {
            console.log("No token provided, returning public channels");

            const publicChannels: WithId<Channel>[] = await channelsCollection.find({ isPrivate: false }).toArray();
            res.json(publicChannels);
            return;
        }

        try {
        } catch (error) {
            console.log("Token verification failed", error); 
            res.sendStatus(400); // bad request
            return;
        }
        const allChannels: WithId<Channel>[] = await channelsCollection.find({}).toArray();
        res.json(allChannels);

    } catch (error) {
        console.error("Error fetching channels:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


channelRouter.post("/", async (req: Request, res: Response) => {
    try {
        await connect();
        const channelsCollection: Collection<Channel> = db.collection("channels");
        
        const newChannel = {
            name: req.body.name,
            channelId: req.body.channelId,
            members: [],
            isPrivate: false,
            parentChannel: "Coding" // добавляем поле для группировки
        };

        const result = await channelsCollection.insertOne(newChannel);
        res.status(201).json({ _id: result.insertedId, ...newChannel });
    } catch (error) {
        console.error("Error creating channel:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export { channelRouter };