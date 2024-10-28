import { ObjectId } from "mongodb";

export interface Channel {
	_id: ObjectId;
	name: string;         
	channelId: string,
	members: ObjectId[];   
	isPrivate: boolean,
}
