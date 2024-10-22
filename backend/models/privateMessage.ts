import { ObjectId } from "mongodb"; 

export interface privateMessage {
	_id: ObjectId,
	senderId: string, 
	revieverId: string,
	content: string,
	isPrivate: boolean
}