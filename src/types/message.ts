import { ObjectId } from "mongodb";

export interface Message {
    _id: string;
    senderId: string;
    senderName: string;
    recipientId: string;
    content: string;
    createdAt: Date;
}