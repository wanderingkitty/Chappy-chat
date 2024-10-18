import express from "express";
import { connect, client } from "./data/dbConnection.js";
import { userRouter } from "./routes/userRoute.js";
import { logWithLocation } from "./helpers/betterConsoleLog.js";
const app = express();
const port = process.env.PORT;
// Middleware
app.use(express.json());
// app.use(express.static("./frontend")); 
// Routes
app.get("/", (req, res) => {
    res.status(200).send("Server is running");
    logWithLocation(`Server status ${res.statusCode}`, "success");
});
app.use("/users", userRouter);
/**
 * The `startServer` function attempts to connect to a server, starts listening on a specified port,
 * and logs the success or failure of the operation.
 */
// Start server
async function startServer() {
    try {
        await connect();
        app.listen(port, () => {
            logWithLocation(`Server is running on port ${port}`, "success");
        });
    }
    catch (error) {
        logWithLocation(`Failed to start server: ${error}`, "error");
        await client.close();
        process.exit(1);
    }
}
startServer();
