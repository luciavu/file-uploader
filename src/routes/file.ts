import { Router } from 'express';
import {
  getUploadFile,
  getDeleteFile,
  getDetailsFile,
  getDownloadFile,
  postUploadFile,
  postDeleteFile,
} from '../controllers/fileController';
import multer from 'multer';
import isAuth from '../middleware/authMiddleware';

const fileRouter = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get Routes
fileRouter.get('/upload', isAuth, getUploadFile);
fileRouter.get('/delete/:id', isAuth, getDeleteFile);
fileRouter.get('/details/:id', isAuth, getDetailsFile);
fileRouter.get('/download/:id', isAuth, getDownloadFile);

// Post Routes
fileRouter.post('/upload', isAuth, upload.single('file'), postUploadFile);
fileRouter.post('/delete/:id', isAuth, postDeleteFile);

// Get Routes
export default fileRouter;
