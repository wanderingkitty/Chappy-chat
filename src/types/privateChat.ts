import { ObjectId } from "mongodb";

export interface Chat {
    _id: string;
    participants: string[];
    recipientName: string;
    senderName: string;
    lastMessage?: Message;
}