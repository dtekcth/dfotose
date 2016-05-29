import express from 'express'
import mongoose from 'mongoose'

import morgan from 'morgan';

import session from 'express-session';
import connectRedis from 'connect-redis';

// Routes
import imageRouter from './routes/image-api';
import authRouter from './routes/auth-api';

mongoose.connect('mongodb://localhost/dfotose');

const app = express();

const RedisStore = connectRedis(session);
const sessionMiddleware = session({
  store: new RedisStore({
    host: '127.0.0.1',
    port: 6379
  }),
  secret: 'XVUtmVft5KwvC7QmsmYF2SJn3z5c8e3B',
  resave: false,
  saveUninitialized: false,
  name: 'dfotose.session',
});

app.use('/', express.static(__dirname + '/public'));

app.use(morgan('dev'));
app.use(sessionMiddleware);

// Include all routes
const baseUrl = '/v1';

// Auth routes should not be prepended
app.use(authRouter);

// Pure API routes should be prepended
app.use(baseUrl, imageRouter);

app.listen(4000, () => {
  console.log('Listening :4000');
});
