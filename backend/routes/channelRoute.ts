import express, { Router, Request, Response } from "express";
import { Collection } from "mongodb";
import { connect, db } from "../data/dbConnection.js";
import jwt from 'jsonwebtoken';

const channelRouter: Router = express.Router();

interface Payload {
    userId: string;
    iat: number;
}


channelRouter.get("/", async (req: Request, res: Response) => {
    console.log("GET request to /channels received"); 

    if (!process.env.SECRET) {
        console.log("SECRET is not defined"); 
        res.sendStatus(500);
        return;
    }

    let token = req.headers.authorization;
    console.log('Header:', token);

    try {
        await connect();
        const channelsCollection: Collection = db.collection("channels");
        
        if (!token) {
            console.log("No token provided, returning public channels");
            // Пользователь не аутентифицирован, возвращаем только открытые каналы
            const publicChannels = await channelsCollection.find({ isPrivate: false }).toArray();
            res.json(publicChannels);
            return;
        }

        let payload: Payload;
        try {
            payload = jwt.verify(token, process.env.SECRET) as Payload;
            console.log('Payload: ', payload);
        } catch (error) {
            console.log("Token verification failed", error); // Добавьте эту строку
            res.sendStatus(400); // bad request
            return;
        }

        console.log("Token verified, returning all channels"); // Добавьте эту строку
        // JWT верифицирован, возвращаем все каналы
        const allChannels = await channelsCollection.find({}).toArray();
        res.json(allChannels);

    } catch (error) {
        console.error("Error fetching channels:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export { channelRouter };