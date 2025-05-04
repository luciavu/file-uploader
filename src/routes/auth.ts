import { Router } from 'express';
import {
  getLogin,
  getRegister,
  getLogout,
  postLogin,
  postRegister,
} from '../controllers/authController';
const authRouter = Router();

// Post Routes
authRouter.post('/login', postLogin);
authRouter.post('/register', postRegister);

// Get Routes
authRouter.get('/login', getLogin);
authRouter.get('/register', getRegister);
authRouter.get('/logout', getLogout);

export default authRouter;
