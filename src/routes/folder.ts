import { Router } from 'express';
import {
  getNewFolder,
  getFolder,
  getAllFolders,
  getUpdateFolder,
  getDeleteFolder,
  postNewFolder,
  postUpdateFolder,
  postDeleteFolder,
} from '../controllers/folderController';
import isAuth from '../middleware/authMiddleware';
const folderRouter = Router();

// Post Routes
folderRouter.post('/folders/new', postNewFolder);
folderRouter.post('/folders/delete/:folderId', isAuth, postDeleteFolder);
folderRouter.post('/folders/update/:folderId', isAuth, postUpdateFolder);

// Get Routes
folderRouter.get('/folders', isAuth, getAllFolders);
folderRouter.get('/folders/new', isAuth, getNewFolder);
folderRouter.get('/folders/:folderId', isAuth, getFolder);
folderRouter.get('/folders/delete/:folderId', isAuth, getDeleteFolder);
folderRouter.get('/folders/update/:folderId', isAuth, getUpdateFolder);

export default folderRouter;
