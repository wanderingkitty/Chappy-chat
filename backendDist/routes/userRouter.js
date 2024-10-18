import { Router } from "express";
import { db } from "../db/dbConnection.js";
import { getUsers } from "../user/getUsers.js";
const userRouter = Router();
let collection;
/* This code snippet is setting up a middleware function for the `userRouter` in an Express
application. The middleware function is using the `use` method of the `userRouter` to perform some
operations before passing the control to the next middleware function in the chain. */
userRouter.use((_req, _res, next) => {
    collection = db.collection("users");
    next();
});
userRouter.get('/users', async (req, res) => {
    await getUsers(req, res, collection);
});
export { userRouter };
