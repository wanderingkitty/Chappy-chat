import express, { Request, Response } from 'express';
import { connect, client } from './data/dbConnection.js';
import { userRouter } from './routes/userRoute.js';
import { logWithLocation } from './helpers/betterConsoleLog.js';
import { channelRouter } from './routes/channelRoute.js';
import { messageRouter } from './routes/messageRoute.js';
import { privateMessageRouter } from './routes/privateMessageRoute.js';
import { privateChatRoute } from './routes/privateChatRoute.js';

console.log('CONNECTION_STRING:', process.env.CONNECTION_STRING);

const app = express();
const port = process.env.PORT || 4444;

// Middleware
app.use('/static', express.static('backendDist/'))
app.use(express.json());
app.use('/', (req, _res, next) => {
    console.log(`${req.method} ${req.url}`, req.body);
    next();
});

// Routes
app.get('/', (_req: Request, res: Response) => {
    res.status(200).send("Server is running");
    logWithLocation(`Server status ${res.statusCode}`, "success");
});

app.use('/users', userRouter);
app.use('/channels', channelRouter);
app.use('/messages', messageRouter)
app.use('/private-messages', privateMessageRouter);
app.use('/private-messages', privateChatRoute)

/**
 * Start server
 */
async function startServer() {
    try {
        await connect(); 
        app.listen(port, () => {
            logWithLocation(`Server is running on port ${port}`, "success");
        });
    } catch (error) {
        logWithLocation(`Failed to start server: ${error}`, "error");
        await client.close();
        process.exit(1);
    }
}

startServer();