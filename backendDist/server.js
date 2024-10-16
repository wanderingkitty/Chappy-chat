import express from 'express';
import { connect, client } from './data/dbConnection.js';
import { userRouter } from './routes/userRoute.js';
import { logWithLocation } from './helpers/betterConsoleLog.js';
import jwt from 'jsonwebtoken';
import { validateLogin } from './validation/validateLogin.js';
const app = express();
const port = process.env.PORT || 4444;
// Middleware
app.use(express.json());
app.use('/', (req, res, next) => {
    console.log(`${req.method} ${req.url}`, req.body);
    next();
});
// Routes
app.get('/', (req, res) => {
    res.status(200).send("Server is running");
    logWithLocation(`Server status ${res.statusCode}`, "success");
});
app.use('/users', userRouter); // Assuming userRouter has relevant user routes
// Login Route
app.post('/login', async (req, res) => {
    if (!process.env.SECRET) {
        res.sendStatus(500);
        return;
    }
    console.log('Body är: ', req.body);
    const { username, password } = req.body;
    try {
        // Ensure you connect to the database and get the collection
        const collection = await connect(); // Now this returns the User collection
        // Validate login
        const user = await validateLogin(username, password, collection);
        console.log('User: ', user);
        if (!user) {
            // Unauthorized
            res.status(401).send({
                "error": "Unauthorized",
                "message": "You are not authorized to access this resource."
            });
            return;
        }
        // Create JWT
        const payload = {
            userId: user._id.toString() // Adjust to match your User model
        };
        const token = jwt.sign(payload, process.env.SECRET);
        res.send({ jwt: token });
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).send({
            "error": "Server Error",
            "message": "An error occurred during login."
        });
    }
});
/**
 * Start server
 */
async function startServer() {
    try {
        await connect(); // Ensure database connection
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
