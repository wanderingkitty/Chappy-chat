import { ObjectId } from "mongodb";

export interface User {
	_id: ObjectId, 
	userId: string
	name: string,
	password: string,
	isGuest: boolean
}
