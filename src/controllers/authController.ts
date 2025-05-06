import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import passport from 'passport';
import { genPassword } from '../lib/passwordUtils';
import { body, validationResult } from 'express-validator';
const prisma = new PrismaClient();

const lengthErr = 'must be between 3 and 15 characters.';

const validateUser = [
  body('username').trim().isLength({ min: 3, max: 15 }).withMessage(`Username ${lengthErr}`),
  body('password').trim().isLength({ min: 3, max: 15 }).withMessage(`Password ${lengthErr}`),
  body('confirmpassword')
    .trim()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage(`Passwords don't match`),
];

export const postLogin = passport.authenticate('local', {
  failureRedirect: '/login',
  successRedirect: '/home',
});

export const postRegister = [
  ...validateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      const { username, password } = req.body;

      // Check password and username between 3 - 15 chars, passwords match
      if (!errors.isEmpty()) {
        return res.status(400).render('register', { errors: errors.array() });
      }

      // Check if username already exists
      const existingUser = await prisma.user.findUnique({ where: { username } });
      if (existingUser) {
        return res.status(400).render('register', {
          errors: [{ msg: 'Username already taken.' }],
        });
      }

      const { hash } = genPassword(password);
      // Insert new user into database
      await prisma.user.create({ data: { username: req.body.username, password: hash } });
      res.redirect('/');
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
];

export const getLogout = (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

export const getRegister = (req: Request, res: Response) => {
  res.render('register');
};

export const getHome = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = await prisma.file.findMany();
    res.render('home', { section: 'Home', folder: null, files: files });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
