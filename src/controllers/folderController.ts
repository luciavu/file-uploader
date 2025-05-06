import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
const prisma = new PrismaClient();

const lengthErr = 'must be between 3 and 15 characters.';

const validateFolder = [
  body('foldername').trim().isLength({ min: 3, max: 15 }).withMessage(`Folder name ${lengthErr}`),
];

export const getNewFolder = (req: Request, res: Response) => {
  res.render('new-folder');
};

export const getAllFolders = async (req: Request, res: Response, next: NextFunction) => {
  res.render('home', { section: 'Folders', folder: null });
};

export const getFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { folderId } = req.params;
    const folder = await prisma.folder.findUnique({ where: { id: Number(folderId) } });

    if (!folder) {
      return res.status(404).send('Folder not found');
    }
    res.render('home', { folder: folder });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getUpdateFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { folderId } = req.params;
    const folder = await prisma.folder.findUnique({ where: { id: Number(folderId) } });

    if (!folder) {
      return res.status(404).send('Folder not found');
    }
    res.render('update-folder', { folder });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getDeleteFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { folderId } = req.params;
    const folder = await prisma.folder.findUnique({ where: { id: Number(folderId) } });
    res.render('delete', { type: 'folder', folderId, name: folder.name });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const postUpdateFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { folderId } = req.params;
    const { newName } = req.body;
    const updateFolder = await prisma.folder.update({
      where: {
        id: Number(folderId),
      },
      data: {
        name: newName,
      },
    });
    console.log(updateFolder);
    res.redirect('/home');
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const postDeleteFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { folderId } = req.params;
    const folderIdNum = Number(folderId);

    // Delete related files first, then delete folder
    const deleteFiles = await prisma.file.deleteMany({
      where: {
        folderId: folderIdNum,
      },
    });

    const deleteFolder = await prisma.folder.delete({
      where: { id: folderIdNum },
    });

    res.redirect('/home');
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const postNewFolder = [
  ...validateFolder,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      const { foldername } = req.body;

      // Folder name between 3-15 char
      if (!errors.isEmpty()) {
        return res.status(400).render('new-folder', { errors: errors.array() });
      }

      // Check if folder already exists for that user
      const existingUserFolder = await prisma.folder.findFirst({
        where: { name: foldername, userId: req.user.id },
      });
      if (existingUserFolder) {
        return res.status(400).render('new-folder', {
          errors: [{ msg: 'This folder already exists.' }],
        });
      }

      // Insert new folder into DB
      await prisma.folder.create({ data: { name: foldername, userId: req.user.id } });
      res.redirect('/home');
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
];
