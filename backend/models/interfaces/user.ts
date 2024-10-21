import { ObjectId } from "mongodb";

export interface User {
	_id: ObjectId, 
	name: string,
	password: string,
	isGuest: boolean
}
