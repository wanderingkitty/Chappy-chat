import { Request, Response } from "express"; 
import { Collection } from "mongodb"; 
import { User } from "../interface/users.ts";


export const getUsers = async (
    req: Request,
    res: Response,
    collection: Collection<User>
) => {
    try {
        console.log("Trying to get users");
        console.log("Collection:", collection);
        const users = await collection.find().toArray()
		if(users.length === 0) {
			res.status(404)
			console.log("No users found");
			console.log(`${res.statusCode}`);
			return res.json({
				message: "No users found"
			})
		}

		console.log("User found!");
		res.status(200)
		console.log(`${res.statusCode}`);
		return res.json({
			users,
		})
} 	catch(error: any) {
	console.log(`Error fetching users: ${error.message}`);
	res.status(500)
	console.log(`${res.statusCode}`);
	return res.json({
		message: "Error fethcing users",
		error: error.message
	})
	
} 
}