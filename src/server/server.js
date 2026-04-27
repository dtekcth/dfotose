const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const fs = require('fs');
const path = require('path');

const morgan = require('morgan');

const session = require('express-session');
const { RedisStore } = require('connect-redis');
const { createClient } = require('redis');

const Webpack = require('./webpack');

// Routes
const imageRouter = require('./routes/image-api');
const galleryRouter = require('./routes/gallery-api');
const stressTestRouter = require('./routes/stress-test-api');
const { router: authRouter} = require('./routes/auth-api');
const { router: userRoleRouter } = require('./routes/user-role-api');
const { getGallerySsrData } = require('./services/gallery-ssr-data');

const config = require('./config');

mongoose.set('strictQuery', false);

const connectWithRetry = () => {
  console.log('MongoDB connection with retry');
  mongoose.connect(
    `mongodb://${config.database.host}:27017/${config.database.name}`
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

const redisClient = createClient({
  socket: {
    host: config.redis.host,
    port: 6379
  }
});

redisClient.on('error', err => {
  console.error(`Redis error: ${err}`);
});

redisClient.connect().catch(err => {
  console.error(`Initial Redis connection error: ${err}`);
});

const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  name: 'dfotose.session'
});

if (process.env.NODE_ENV !== "production") {
  Webpack(app);
}

function escapeJsonForHtml(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function readIndexTemplate() {
  return fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8');
}

function renderDocument(appHtml, ssrData) {
  const template = readIndexTemplate();
  const serializedState = escapeJsonForHtml(ssrData);

  // Keep the HTML shell owned by index.html, then inject only the server markup
  // and the matching data needed for hydration.
  return template.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div><script>window.__DFOTO_SSR_DATA__=${serializedState};</script>`
  );
}

function setPublicFileCacheHeaders(res, filePath) {
  if (/\.(?:js|css|woff2?)$/i.test(filePath)) {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}

async function renderGalleryRoute(req, res, next) {
  try {
    const ssrData = await getGallerySsrData(req);
    const { renderPage } = require('./ssr/render');
    const appHtml = renderPage(req.originalUrl, ssrData);

    res.set('Cache-Control', 'public, max-age=30');
    res.send(renderDocument(appHtml, ssrData));
  } catch (err) {
    next(err);
  }
}

// Basic security module
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  originAgentCluster: false,
  referrerPolicy: false
}));

app.use(compression());

app.use('/assets', express.static(__dirname + '/public/assets', {
  immutable: process.env.NODE_ENV === 'production',
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0
}));
app.use('/', express.static(__dirname + '/public', {
  index: false,
  setHeaders: setPublicFileCacheHeaders
}));

app.use(morgan('dev'));
app.use(sessionMiddleware);

// Include all routes
const baseUrl = '/v1';

app.use(authRouter);
app.use(baseUrl, imageRouter);
app.use(baseUrl, galleryRouter);
app.use(baseUrl, stressTestRouter);
app.use(baseUrl, userRoleRouter);

app.get(
  ['/', '/gallery/page/:pageNumber', '/gallery/:id', '/image/search/:tag', '/image/photographer/:cid'],
  renderGalleryRoute
);

// Non-gallery browser routes keep the original SPA behavior.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(config.port, () => {
  console.log(`Listening :${config.port}`);
});
