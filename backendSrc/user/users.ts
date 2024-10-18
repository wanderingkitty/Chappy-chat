import { connect, client, dbName } from "../db/dbConnection";

export type UserId = string

export interface User {
	name: string, 
	password: string, 
	id: UserId;
}

async function validateLogin(name: string, password: string ): Promise<UserId | null> {
	await connect()

	const db = client.db(dbName)
	const collection = db.collection<User>("users")


	const mathcingUser = await collection.findOne({name:name, password: password})
	if( mathcingUser ) {
		return mathcingUser.id
	}
	return null
}

async function getUserData(userId: UserId): Promise<User | null> {
    await connect();

    const db = client.db(dbName); 
    const collection = db.collection<User>("users");

    // Find the user by ID
    const user = await collection.findOne({ id: userId });
    return user; 
}

export { client, connect, validateLogin, getUserData };