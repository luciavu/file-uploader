import { Router } from 'express';
import { getUploadFile, postUploadFile } from '../controllers/uploadController';
import multer from 'multer';
import isAuth from '../middleware/authMiddleware';

const uploadRouter = Router();
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});
const upload = multer({ storage });

// Get Routes
uploadRouter.get('/upload', isAuth, getUploadFile);

// Post Routes
uploadRouter.post('/upload', isAuth, upload.single('file'), postUploadFile);

// Get Routes
export default uploadRouter;
