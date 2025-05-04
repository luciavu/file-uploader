require('dotenv').config();
import path from 'path';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import passport from 'passport';
import helmet from 'helmet';
import indexRouter from './routes/index';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';

// Create Express app
const app = express();

app.use(helmet());
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
const prisma = new PrismaClient();

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: process.env.SESSION_SECRET as string,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

// Passport Authentication
require('./config/passport');
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.user = req.user;
  console.log(req.session);
  console.log(req.user);
  next();
});

// Routes
app.use(indexRouter);

// Error
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

export default app;
