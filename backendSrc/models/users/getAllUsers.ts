import { Request, Response } from "express"; 
import { Collection } from "mongodb"; 
import { User } from "../interfaces/user.js"
import { logWithLocation } from "../../helpers/betterConsoleLog.js";

export const getAllUsers = async(
	req: Request,
	res: Response,
	collection: Collection<User>
) => {
	try {
		logWithLocation(`Trying to get all users..`, "info");

		const users = await collection.find().toArray()
		
		if(users.length === 0) {
			res.status(404)
			logWithLocation(`No user found..`, "error");
			logWithLocation(`${res.statusCode}`, "server");
			return res.json({
				message: "No users found"
			})
		}

		logWithLocation(`User found!`, "success");
		res.status(200)
		logWithLocation(`${res.statusCode}`, "server");
		return res.json({
			users,
		})
		
	} catch (error: any) {
		logWithLocation(`Error fetching users: ${error.message}`, "error");
		res.status(500)
		logWithLocation(`${res.statusCode}`, "server");
		return res.json({
			message: "Error fetching users",
			error: error.message,
		})
		
	}
}


