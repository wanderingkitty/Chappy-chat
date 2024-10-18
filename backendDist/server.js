import express from "express";
import { connect, client } from "./db/dbConnection.js";
import { userRouter } from "./routes/userRouter.js";
const app = express();
const port = process.env.PORT;
app.use(express.json());
// app.use('/', (req, res, next) => {
// 	console.log(`${req.method} ${req.url}`, req.body);
// 	next()
// })
// app.use('/', express.static('./frontend'))
app.get("/", (_req, res) => {
    res.status(200).send("Server is running");
    console.log(`Server status ${res.statusCode}`);
});
app.use("/users", userRouter);
async function startServer() {
    try {
        await connect();
        app.listen(port, () => {
            console.log(`Server is running on port ${port}...`);
        });
    }
    catch (error) {
        console.log(`Failed to start server: ${error}`);
        await client.close();
        process.exit(1);
    }
}
startServer();
