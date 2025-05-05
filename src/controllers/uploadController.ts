import { Request, RequestHandler, Response } from 'express';

export const getUploadFile = (req: Request, res: Response) => {
  res.render('upload');
};

export const postUploadFile = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  console.log('Uploaded file:', req.file);
  console.log(`File uploaded successfully as ${req.file.filename}`);
  res.render('home');
};
