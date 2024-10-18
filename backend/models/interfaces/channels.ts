import { ObjectId } from "mongodb";

export interface Channel {
	_id: ObjectId;
	name: string;          // Название канала
	channelId: string,
	members: ObjectId[];   // Массив пользователей, которые входят в канал
	isPrivate: boolean,
}
