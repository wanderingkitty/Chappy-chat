import { MongoClient } from "mongodb";
import { logWithLocation } from "../helpers/betterConsoleLog.js";
const connectionString = process.env.CONNECTION_STRING;
const dbName = process.env.MONGODB_DB_NAME;
if (!connectionString) {
    console.error("CONNECTION_STRING is not defined in environment variables");
    process.exit(1);
}
if (!dbName) {
    console.error("MONGODB_DB_NAME is not defined in environment variables");
    process.exit(1); // Stop execution if dbName is not defined
}
const client = new MongoClient(connectionString);
let db;
/**
 * The function `connect` establishes a connection to a database using an asynchronous operation in
 * TypeScript and returns the User collection.
 */
async function connect() {
    try {
        await client.connect();
        db = client.db(dbName);
        logWithLocation(`Connected to ${dbName} successfully.`, "success");
        // Return the User collection directly
        return db.collection("users");
    }
    catch (error) {
        logWithLocation(`Failed to connect to ${dbName}. ${error}`, "error");
        process.exit(1);
    }
}
export { client, db, connect };
