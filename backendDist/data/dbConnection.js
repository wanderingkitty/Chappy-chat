import { MongoClient } from "mongodb";
import { logWithLocation } from "../helpers/betterConsoleLog.js";
import 'dotenv/config';
const dbName = process.env.MONGODB_DB_NAME;
const connectionString = process.env.CONNECTION_STRING;
if (!connectionString) {
    console.error("CONNECTION_STRING is not defined in environment variables");
    process.exit(1);
}
if (!dbName) {
    throw new Error("MONGODB_DB_NAME is not defined in environment variables");
}
const client = new MongoClient(connectionString);
let db;
/**
 * Establishes a connection to the database and returns the User collection.
 */
async function connect() {
    try {
        await client.connect();
        db = client.db(dbName);
        logWithLocation(`Connected to ${dbName} successfully.`, "success");
        return db.collection("users");
    }
    catch (error) {
        logWithLocation(`Failed to connect to ${dbName}. ${error}`, "error");
        throw error;
    }
}
/**
 * Closes the database connection.
 */
async function closeConnection() {
    await client.close();
    logWithLocation("Database connection closed.", "info");
}
export { connect, closeConnection, client, db };
