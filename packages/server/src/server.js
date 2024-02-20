import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';

import morgan from 'morgan';

import session from 'express-session';
import MongoStore from 'connect-mongo';

// Routes
import imageRouter from './routes/image-api.js';
import galleryRouter from './routes/gallery-api.js';
import authRouter from './routes/auth-api.js';
import userRoleRouter from './routes/user-role-api.js';

await mongoose.connect(process.env.MONGODB_URL ?? '');

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL ?? '',
    }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET ?? 'haha-secret',
  }),
);

app.use(express.static(new URL('../public', import.meta.url).pathname));

const apiRouter = express.Router();
apiRouter.use(imageRouter);
apiRouter.use(galleryRouter);
apiRouter.use(userRoleRouter);

app.use(authRouter);
app.use('/v1', apiRouter);

app.get('*', (req, res) => {
  res.sendFile(new URL('../public/index.html', import.meta.url).pathname);
});

const server = app.listen(process.env.PORT ?? 4000, () => {
  console.log(`Listening :${process.env.PORT ?? 4000}`);
});

// Docker is stupid
process.on('SIGTERM', function () {
  console.log('SIGTERM received, shutting down...');
  process.exit(0);
});
