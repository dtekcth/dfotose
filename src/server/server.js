const express = require('express');
const mongoose = require('mongoose');
const modRewrite = require('connect-modrewrite');
const helmet = require('helmet');

const morgan = require('morgan');

const session = require('express-session');
const connectRedis = require('connect-redis');

const Webpack = require('./webpack');

// Routes
const imageRouter = require('./routes/image-api');
const galleryRouter = require('./routes/gallery-api');
const { router: authRouter} = require('./routes/auth-api');
const { router: userRoleRouter } = require('./routes/user-role-api');

const config = require('./config');


mongoose.promise = global.Promise;

const connectWithRetry = () => {
  console.log('MongoDB connection with retry');
  mongoose.connect(
    `mongodb://${config.database.host}:27017/${config.database.name}`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  ).catch(err => {
    console.error(`Initial connection error: ${err}`);
  });
};

mongoose.connection.on('error', err => {
  console.error(`MongoDB error: ${err}`);
  setTimeout(connectWithRetry, 5000);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected! Retrying in 5s...');
  setTimeout(connectWithRetry, 5000);
});

connectWithRetry();


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

if (process.env.NODE_ENV !== "production") {
  Webpack(app);
}

// Basic security module
app.use(helmet());

app.use(modRewrite([
  '^\/(?!(v1|auth|assets|favicon\.ico|robots\.txt|bundle.js)).*$ /index.html'
]));

app.use('/', express.static(__dirname + '/public'));

app.use(morgan('dev'));
app.use(sessionMiddleware);

// Include all routes
const baseUrl = '/v1';

app.use(authRouter);
app.use(baseUrl, imageRouter);
app.use(baseUrl, galleryRouter);
app.use(baseUrl, userRoleRouter);

app.listen(config.port, () => {
  console.log(`Listening :${config.port}`);
});
