import { Router, Request, Response} from "express"; 
import { Collection, ObjectId } from "mongodb";
import { db } from "../data/dbConnection.js"; 
import { User } from "../interfaces/user.js"; 
import { getAllUsers } from "../models/users/getAllUsers.js";

const userRouter = Router()
let collection: Collection<User>

userRouter.use((req: Request, res: Response, next) => {
	collection = db.collection<User>("users")
	next()
})

userRouter.get("/", async(req: Request, res: Response) => {
	await getAllUsers(req, res, collection)
})

export { userRouter }