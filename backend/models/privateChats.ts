import { ObjectId } from "mongodb";

export interface PrivateChat {
	_id: ObjectId;
	isPrivate: boolean,
	recipientName: string
}