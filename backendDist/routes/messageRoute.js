import express from "express";
import { ObjectId } from "mongodb";
import { connect, db } from "../data/dbConnection.js";
import { authenticate } from "../data/authMiddleware.js";
const messageRouter = express.Router();
messageRouter.get("/:channelId", authenticate, async (req, res) => {
    console.log("Получен запрос на получение сообщений для канала:", req.params.channelId);
    try {
        await connect();
        const messageCollection = db.collection("messages");
        const channelsCollection = db.collection("channels");
        // Создаем ObjectId из параметра
        const channelObjectId = new ObjectId(req.params.channelId);
        // Проверяем существование канала
        const channel = await channelsCollection.findOne({
            _id: channelObjectId
        });
        if (!channel) {
            console.log("Канал не найден");
            res.status(404).json({ error: "Channel not found" });
            return;
        }
        // Ищем сообщения по ObjectId
        const messages = await messageCollection
            .find({
            channelId: channelObjectId // Используем ObjectId для поиска
        })
            .sort({ createdAt: 1 })
            .toArray();
        console.log(`Найдено ${messages.length} сообщений:`, messages);
        res.json(messages);
    }
    catch (error) {
        console.error("Ошибка при получении сообщений:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
messageRouter.post("/", authenticate, async (req, res) => {
    console.log("Получен запрос на создание сообщения:", req.body);
    try {
        await connect();
        const messagesCollection = db.collection("messages");
        const channelsCollection = db.collection("channels");
        const { content, channelId } = req.body;
        const user = req.user;
        if (!content || !channelId) {
            res.status(400).json({ error: "Content and channel ID are required" });
            return;
        }
        // Создаем ObjectId для channelId
        const channelObjectId = new ObjectId(channelId);
        // Проверяем существование канала
        const channel = await channelsCollection.findOne({
            _id: channelObjectId
        });
        if (!channel) {
            res.status(404).json({ error: "Channel not found" });
            return;
        }
        // Создаем сообщение с ObjectId для channelId
        const newMessage = {
            senderId: user ? user._id : 'guest',
            senderName: user ? user.name : "Guest",
            channelId: channelObjectId, // Сохраняем как ObjectId
            content: content,
            createdAt: new Date()
        };
        console.log("Сохраняем новое сообщение:", newMessage);
        const result = await messagesCollection.insertOne(newMessage);
        // Получаем и возвращаем сохраненное сообщение
        const savedMessage = await messagesCollection.findOne({
            _id: result.insertedId
        });
        res.status(201).json(savedMessage);
    }
    catch (error) {
        console.error("Ошибка при создании сообщения:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
export { messageRouter };
