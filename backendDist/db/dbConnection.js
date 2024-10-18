/**
 * The above code snippet establishes a connection to a MongoDB server using a provided connection
 * string and exports the client, connection function, and database object for further use.
 */
import "dotenv/config";
import { MongoClient } from "mongodb";
const connectionString = process.env.CONNECTION_STRING;
const dbName = process.env.MONGODB_DB_NAME;
/* The code snippet you provided is checking if the `CONNECTION_STRING` environment variable is
defined. If the `CONNECTION_STRING` is not defined, it will log an error message saying
"CONNECTION_STRING is not defined in environment variables" to the console and then exit the process
with an exit code of 1 using `process.exit(1)`. This ensures that the program does not continue
execution without a valid connection string, as it is necessary for establishing a connection to the
MongoDB server. */
if (!connectionString) {
    console.error("CONNECTION_STRING is not defined in environment variables");
    process.exit(1);
}
if (!dbName) {
    console.error("MONGODB_DB_NAME is not defined in environment variables");
}
/**
 * The function establishes a connection to a MongoDB server using a MongoClient in TypeScript.
 */
const client = new MongoClient(connectionString);
let db;
async function connect() {
    try {
        await client.connect();
        db = client.db(dbName);
        console.log(`Connected to ${dbName} successfully.`);
    }
    catch (error) {
        console.error(`Failed to connect to ${dbName}. ${error}`);
    }
}
export { client, connect, db };
