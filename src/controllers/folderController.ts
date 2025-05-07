import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
const prisma = new PrismaClient();
import supabase from '../lib/supabaseClient';

const lengthErr = 'must be between 3 and 15 characters.';

const validateFolder = [
  body('foldername').trim().isLength({ min: 3, max: 15 }).withMessage(`Folder name ${lengthErr}`),
];

export const getNewFolder = (req: Request, res: Response) => {
  res.render('new-folder');
};

export const getAllFolders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = await prisma.folder.findMany({ where: { userId: req.user.id } });
    res.render('home', {
      section: 'Folders',
      folder: null,
      files: files,
      download: false,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { folderId } = req.params;
    const folder = await prisma.folder.findFirst({
      where: { id: Number(folderId), userId: req.user.id },
    });

    if (!folder) {
      return res.status(404).render('unauthorised', { message: 'Folder not found' });
    }
    const files = await prisma.file.findMany({
      where: { folderId: Number(folderId), userId: req.user.id },
    });

    res.render('home', { folder: folder, files: files, download: true });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getUpdateFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { folderId } = req.params;
    const folder = await prisma.folder.findFirst({
      where: { id: Number(folderId), userId: req.user.id },
    });

    if (!folder) {
      return res.status(404).render('unauthorised', { message: 'Folder not found' });
    }
    res.render('update-folder', { folder });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getDeleteFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const folder = await prisma.folder.findFirst({
      where: { id: Number(id), userId: req.user.id },
    });
    if (!folder) {
      return res.status(404).render('unauthorised', { message: 'Folder not found' });
    }

    res.render('delete', { type: 'folder', id, name: folder.name });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const postUpdateFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { folderId } = req.params;
    const { newName } = req.body;
    const folder = await prisma.folder.findFirst({
      where: {
        id: Number(folderId),
        userId: req.user.id,
      },
    });

    if (!folder) {
      return res.status(404).render('unauthorised', { message: 'Folder not found' });
    }

    await prisma.folder.update({
      where: { id: folder.id },
      data: {
        name: newName,
      },
    });
    res.redirect('/home');
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const postDeleteFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const folder = await prisma.folder.findFirst({
      where: { id: Number(id), userId: req.user.id },
    });

    if (!folder) {
      return res.status(404).render('unauthorised', { message: 'Folder not found' });
    }

    const files = await prisma.file.findMany({
      where: {
        folderId: Number(id),
        userId: req.user.id,
      },
      select: {
        name: true,
      },
    });

    // Delete files from supabase storage
    const fileNames = files.map((file: { name: string }) => file.name);
    if (fileNames.length > 0) {
      const { data, error } = await supabase.storage.from('files').remove(fileNames);
      if (error) throw error;
    }

    // Delete files first, then delete folder
    const deleteFiles = await prisma.file.deleteMany({
      where: {
        folderId: Number(id),
        userId: req.user.id,
      },
    });

    const deleteFolder = await prisma.folder.delete({
      where: { id: folder.id },
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
