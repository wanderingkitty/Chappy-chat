import express from "express";
import { connect, db } from "../data/dbConnection.js";
import jwt from 'jsonwebtoken';
const channelRouter = express.Router();
channelRouter.get("/", async (req, res) => {
    if (!process.env.SECRET) {
        console.log("SECRET is not defined");
        res.sendStatus(500);
        return;
    }
    let token = req.headers.authorization;
    console.log('Header:', token);
    try {
        await connect();
        const channelsCollection = db.collection("channels");
        if (!token) {
            console.log("No token provided, returning public channels");
            const publicChannels = await channelsCollection.find({ isPrivate: false }).toArray();
            res.json(publicChannels);
            return;
        }
        let payload;
        try {
            payload = jwt.verify(token, process.env.SECRET);
            console.log('Payload: ', payload);
        }
        catch (error) {
            console.log("Token verification failed", error);
            res.sendStatus(400); // bad request
            return;
        }
        console.log("Token verified, returning all channels");
        const allChannels = await channelsCollection.find({}).toArray();
        res.json(allChannels);
    }
    catch (error) {
        console.error("Error fetching channels:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
export { channelRouter };
