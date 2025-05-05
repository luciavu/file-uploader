import { NextFunction, Request, Response } from 'express';

const isAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.status(401).render('unauthorised', {
      message: 'You are not authorized to view this resource. Please login.',
    });
  }
};

export default isAuth;
