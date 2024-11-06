import express from 'express';
import { connect, client } from './data/dbConnection.js';
import { userRouter } from './routes/userRoute.js';
import { logWithLocation } from './helpers/betterConsoleLog.js';
import { channelRouter } from './routes/channelRoute.js';
import { messageRouter } from './routes/messageRoute.js';
import { privateMessageRouter } from './routes/privateMessageRoute.js';
import { privateChatRoute } from './routes/privateChatRoute.js';
const app = express();
const port = Number(process.env.PORT) || 4444;
// Middleware
app.use('/', express.static('dist/'));
app.use(express.json());
app.use('/', (req, _res, next) => {
    console.log(`${req.method} ${req.url}`, req.body);
    next();
});
// Routes
app.get('/', (_req, res) => {
    res.status(200).send("Server is running");
    logWithLocation(`Server status ${res.statusCode}`, "success");
});
app.use('/api/users', userRouter);
app.use('/api/channels', channelRouter);
app.use('/api/messages', messageRouter);
app.use('/api/private-messages', privateMessageRouter);
app.use('/api/private-chats', privateChatRoute);
/**
 * Start server
 */
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
