import { ObjectId } from "mongodb";

export interface PrivateChat {
	_id: ObjectId;
	participants: string[];
	isPrivate: boolean,
	createdAt: Date;
}