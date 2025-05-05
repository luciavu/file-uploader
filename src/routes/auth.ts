import { Router } from 'express';
import {
  getRegister,
  getLogout,
  getHome,
  postLogin,
  postRegister,
} from '../controllers/authController';
import isAuth from '../middleware/authMiddleware';
const authRouter = Router();

// Post Routes
authRouter.post('/login', postLogin);
authRouter.post('/register', postRegister);

// Get Routes
authRouter.get('/register', getRegister);
authRouter.get('/logout', getLogout);
authRouter.get('/home', isAuth, getHome);
export default authRouter;
