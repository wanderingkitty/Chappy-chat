import { Collection } from "mongodb";
import { User } from "../models/user.js"; 

export type UserId = string

export async function validateLogin(username: string, password: string, collection: Collection<User>): Promise<User | null> {
    const user = await collection.findOne({ name: username });
    console.log("Fetched user from DB:", user); 
    
    if (user && user.password === password) {
        if (user.isGuest) {
            await collection.updateOne({ _id: user._id }, { $set: { isGuest: false } });
            user.isGuest = false;
        }
        return user;
    }
    
    return null;
}