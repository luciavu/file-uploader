import { NextFunction, Request, RequestHandler, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import supabase from '../lib/supabaseClient';

const prisma = new PrismaClient();

export const getUploadFile = (req: Request, res: Response) => {
  res.render('upload');
};

export const getDeleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const file = await prisma.file.findFirst({ where: { id: Number(id), userId: req.user.id } });
    if (!file) {
      return res.status(404).render('unauthorised', { message: 'File not found' });
    }
    res.render('delete', { type: 'file', id, name: file.name });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getDetailsFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const file = await prisma.file.findFirst({
      where: { id: Number(id), userId: req.user.id },
    });
    if (!file) {
      return res.status(404).render('unauthorised', { message: 'File not found' });
    }
    const folder = await prisma.folder.findUnique({ where: { id: file.folderId } });
    res.render('details', { file, folder });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getDownloadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const file = await prisma.file.findFirst({
      where: { id: Number(id), userId: req.user.id },
    });

    if (!file) {
      return res.status(404).render('unauthorised', { message: 'File not found' });
    }

    // Create link to download with 60s expiry
    const { data, error } = await supabase.storage.from('files').createSignedUrl(file.name, 60);
    if (error || !data) throw error;
    res.redirect(data.signedUrl);
    //const filePath = path.join(__dirname, '../../uploads', file.name);
    //res.download(filePath, file.name);
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

    const buffer = req.file.buffer;
    const fileName = `${Date.now()}_${req.file.originalname}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage.from('files').upload(fileName, buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

    if (error) throw error;

    // Save file metadata
    const file = await prisma.file.create({
      data: {
        name: fileName,
        originalName: req.file.originalname,
        owner: req.user.username,
        size: req.file.size,
        folderId: Number(req.body.folder),
        userId: req.user.id,
      },
    });
    res.redirect('/home');
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const postDeleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const file = await prisma.file.findFirst({
      where: { id: Number(id), userId: req.user.id },
    });
    if (!file) {
      return res.status(404).render('unauthorised', { message: 'File not found' });
    }
    await prisma.file.delete({ where: { id: file.id } });

    // Remove from supabase storage
    await supabase.storage.from('files').remove([file.name]);

    res.redirect('/home');
  } catch (err) {
    console.error(err);
    next(err);
  }
};
