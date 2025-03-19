import express from 'express';
import cookieParser from 'cookie-parser';
import channelsRouter from './routes/channels.routes.js';
import  messagesRouter from './routes/messages.routes.js';
import { join } from 'path';
import { __dirname } from '../root.js';
import userRouter from './routes/user.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use( '/static', express.static( join(__dirname, 'public') ) );

// Routers

app.use('/chat_api/channels', channelsRouter);
app.use('/chat_api/messages', messagesRouter);
app.use('/chat_api/user', userRouter);

// Default error handler
app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.statusCode || 500).json({
        message: err.message || 'Internal server error'
    });
});

export default app;
