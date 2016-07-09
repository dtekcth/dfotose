import express from 'express'
import mongoose from 'mongoose'

import morgan from 'morgan';

import session from 'express-session';
import connectRedis from 'connect-redis';

import Webpack from './webpack';

// Routes
import imageRouter from './routes/image-api';
import galleryRouter from './routes/gallery-api';
import authRouter from './routes/auth-api';

import config from './config';

mongoose.connect(`mongodb://${config.database.host}/${config.database.name}`);

const app = express();

const RedisStore = connectRedis(session);
const sessionMiddleware = session({
  store: new RedisStore({
    host: config.redis.host,
    port: 6379
  }),
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  name: 'dfotose.session'
});

Webpack(app);

app.use('/', express.static(__dirname + '/public'));

app.use(morgan('dev'));
app.use(sessionMiddleware);

// Include all routes
const baseUrl = '/v1';

// Auth routes should not be prepended
app.use(authRouter);

// Pure API routes should be prepended
app.use(baseUrl, imageRouter);
app.use(baseUrl, galleryRouter);

app.listen(config.port, () => {
  console.log(`Listening :${config.port}`);
});
