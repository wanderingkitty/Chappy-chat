import { Router, Request, Response } from "express";
import { Collection } from "mongodb";
import { db } from "../db/dbConnection.ts"
import { getUsers } from "../user/getUsers.ts"
import { User } from "../interface/users.ts";

const userRouter = Router()
let collection: Collection<User>

/* This code snippet is setting up a middleware function for the `userRouter` in an Express
application. The middleware function is using the `use` method of the `userRouter` to perform some
operations before passing the control to the next middleware function in the chain. */
userRouter.use((req: Request, res: Response, next) => {
	collection = db.collection<User>("users")
	next()
})

userRouter.get('/users', async (req: Request, res: Response) => {
    await getUsers(req, res, collection);
});


export { userRouter }