import { ObjectId } from "mongodb";

export interface Message {
	_id: ObjectId, 
	messageId: string,
	senderId: string,
	recipientId: ObjectId; 
	chanelId: string,
	content: string, 
	isPrivate: boolean
	sentAt: Date;
}