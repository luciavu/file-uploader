require('dotenv').config();
import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import passport from 'passport';
import helmet from 'helmet';
import pool from './config/db';
import indexRouter from './routes/index';

// Store sessions in postgreSQL connection
import connectPgSimple from 'connect-pg-simple';
const pgSession = connectPgSimple(session);

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
app.use(
  session({
    store: new pgSession({
      pool: pool, // use exisiting pg pool
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'strict',
    },
  })
);

// Passport Authentication
require('./config/passport');
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.user = req.user;
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
