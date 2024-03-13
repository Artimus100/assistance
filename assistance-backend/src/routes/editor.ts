import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import multer from 'multer';
import aws from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
// Example route handler

import { PrismaClient } from '@prisma/client';
import { env } from 'process';

const prisma = new PrismaClient();

const getEditor = async (req: Request, res: Response): Promise<void> => {
    try {
        const editor = await prisma.editor.findMany(); // Using Prisma to fetch all users
        res.json(editor);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const registerEditor = async (req: Request, res: Response): Promise<void> =>{
    try {
        const {username,password, firstname, lastname} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const editor = await prisma.editor.create({
            data: {
                username,
                password: hashedPassword,
                firstname,
                lastname,
            },
        });
        res.status(500).json(editor);
    } catch (error) {
        console.error('Error registering editor:', error);
        throw new Error('Failed to register editor');
    }
}
// onst registerHost = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { username, firstname, lastname, password } = req.body;
//         const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
//         const host = await prisma.host.create({
//             data: {
//                 username,
//                 firstname,
//                 lastname,
//                 password: hashedPassword,
//             },
//         });
//         res.status(201).json(host);
//     } catch (err) {
//         console.error('Error registering host', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };
const loginEditor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body; // Assuming you have these fields in your request body
        const editor = await prisma.editor.findUnique({
            where: {
                username,
            },
        });

        if (!editor) {
            res.status(404).json({ error: 'Editor not found' });
            return;
        }

        // Here you should validate the password against the stored hashed password
        // For simplicity, we're just comparing plain text passwords
        const passwordMatch = await bcrypt.compare(password, editor.password);
        if (!passwordMatch) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const token = jwt.sign({ id: editor.id, email: editor.username }, 'your_secret_key', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', editor, token });
    } catch (err) {
        console.error('Error logging in Editor', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const uploadVideo = async (req: Request, res: Response): Promise<void> => {
    try {
      const s3 = new aws.S3({
        accessKeyId:process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });
  
      // Create a multer instance for handling file uploads
      const upload = multer({
        storage: multer.memoryStorage(), // Store files in memory before uploading to S3
        limits: {
          fileSize: 1024 * 1024 * 1024, // Maximum file size (1GB)
        },
      }).single('video'); // Specify the field name for the uploaded file
  
      // Handle file upload using multer
      upload(req, res, async (err: any) => {
        if (err) {
          console.error('Error uploading file:', err);
          return res.status(500).json({ error: 'Failed to upload file' });
        }
      
        // Check if req.file exists
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
      
        const { title, description, editorId } = req.body;
      
        // Generate a unique key for the file in S3
        const key = `videos/${uuidv4()}-${req.file.originalname}`;
      
        // Upload file to AWS S3 bucket
        const params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: key,
          Body: req.file.buffer,
        };
      
        await s3.upload(params).promise();
      
        // Save the uploaded file details to the database
        const uploadedContent = await prisma.content.create({
          data: {
            title,
            description,
            videoFile: key, // Store the S3 key in the database
            editorId: parseInt(editorId),
          },
        });
      
        res.status(201).json({ message: 'Video uploaded successfully', content: uploadedContent });
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      res.status(500).json({ error: 'Failed to upload video' });
    }
  };
export { registerEditor,getEditor, loginEditor,uploadVideo };
