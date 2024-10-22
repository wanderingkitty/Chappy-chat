import { ObjectId } from "mongodb"; 

export interface privateMessage {
	_id: ObjectId,
	privateChanelId: string,
	senderId: string, 
	revieverId: string,
	content: string,
	isPrivate: boolean,
	createdAt: Date
}