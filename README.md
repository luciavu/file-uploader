# File Uploader

The Odin Project - NodeJS Course Project (4/8):

A personal file storage app inspired by Google Drive.

This application uses Express, PostgreSQL, Passport.js, Prisma ORM, multer, Supabase Cloud Storage, EJS, and bcyrptjs, and is deployed via Render and Supabase.

## Features

- User authentication: login system based on express-sessions and Passport.js
- Folder management: create, read, update and delete folders
- File upload: upload files to Supabase Storage using multer
- Secure file downloads: files are downloaded via signed URLs that expire after 60s
- Cloud Storage - files are stored in Supabase buckets and saved in PostgreSQL via Prisma ORM

## Preview

![alt text](/public/images/preview1.png)
![alt text](/public/images/preview2.png)

## Links

Live link:

Assignment: https://www.theodinproject.com/lessons/nodejs-file-uploader
