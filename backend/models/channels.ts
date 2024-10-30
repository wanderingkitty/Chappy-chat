import { ObjectId } from "mongodb";

export interface Channel {
	name: string;         
	members: ObjectId[];   
	isPrivate: boolean,
}
