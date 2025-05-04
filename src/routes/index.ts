import { Router, Request, Response, NextFunction } from 'express';
import { getHome } from '../controllers/indexController';
const indexRouter = Router();

// Post Routes

// Get Routes
indexRouter.get('/', getHome);

export default indexRouter;
