import express from 'express';
import mongoose from 'mongoose';
import modRewrite from 'connect-modrewrite';
import helmet from 'helmet';

import morgan from 'morgan';

import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

// Routes
import imageRouter from './routes/image-api';
import galleryRouter from './routes/gallery-api';
import authRouter from './routes/auth-api';
import userRoleRouter from './routes/user-role-api';

const connectWithRetry = () => {
  console.log('MongoDB connection with retry');
  mongoose.connect(process.env.MONGODB_URL);
};

// Retry connection on failure
mongoose.connection.on('error', (err) => {
  console.log(`MongoDB connection error: ${err}`);
  setTimeout(connectWithRetry, 5000);
});

const redisClient = createClient({ url: process.env.REDIS_URL });

connectWithRetry();

const app = express();

const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'dfotose.session',
});

// Basic security module
app.use(helmet());

app.use(
  modRewrite([
    '^/(?!(v1|auth|assets|favicon.ico|robots.txt|bundle.js)).*$ /index.html',
  ])
);

app.use('/', express.static(__dirname + '/public'));

app.use(morgan('dev'));
app.use(sessionMiddleware);

// Include all routes
const baseUrl = '/v1';

app.use(authRouter);
app.use(baseUrl, imageRouter);
app.use(baseUrl, galleryRouter);
app.use(baseUrl, userRoleRouter);

app.listen(process.env.PORT, () => {
  console.log(`Listening :${process.env.PORT}`);
});
