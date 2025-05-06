import { NextFunction, Request, RequestHandler, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getUploadFile = (req: Request, res: Response) => {
  res.render('upload');
};

export const getDeleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const file = await prisma.file.findUnique({ where: { id: Number(id) } });
    res.render('delete', { type: 'file', id, name: file.name });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getDetailsFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const file = await prisma.file.findUnique({
      where: { id: Number(id) },
    });
    const folder = await prisma.folder.findUnique({ where: { id: file.folderId } });
    res.render('details', { file, folder });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const postUploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file || !req.body.folder) {
      return res.status(400).send('No folder/file uploaded.');
    }

    const { folder } = req.body;

    // Save file metadata
    const file = await prisma.file.create({
      data: {
        name: req.file.originalname,
        owner: req.user.username,
        size: req.file.size,
        folderId: Number(folder),
        userId: req.user.id,
      },
    });
    console.log('Uploaded file:', req.file);
    console.log(`File uploaded successfully as ${req.file.filename}`);
    console.log('File: ', file);
    res.redirect('/home');
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const postDeleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleteFile = await prisma.file.delete({
      where: {
        id: Number(id),
      },
    });

    res.redirect('/home');
  } catch (err) {
    console.error(err);
    next(err);
  }
};
