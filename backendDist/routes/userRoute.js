import { Router } from "express";
import { db } from "../data/dbConnection.js";
import { getAllUsers } from "../models/users/getAllUsers.js";
const userRouter = Router();
let collection;
userRouter.use((req, res, next) => {
    collection = db.collection("users");
    next();
});
userRouter.get("/", async (req, res) => {
    await getAllUsers(req, res, collection);
});
export { userRouter };
