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
const registerEditor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, firstname, lastname, password } = req.body;

    // Check if the username already exists
    const existingEditor = await prisma.editor.findUnique({ where: { username } });
    if (existingEditor) {
      res.status(400).json({ error: 'Username already exists' });
      return; // Exit the function to avoid sending multiple responses
    }

    // Proceed with editor creation since the username is unique
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdEditor = await prisma.editor.create({
      data: {
        username,
        firstname,
        lastname,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ username, role: 'editor' }, 'your-secret-key', { expiresIn: '1h' });

    // Respond with token and editor data
    res.status(201).json({ editor: createdEditor, token });
  } catch (error) {
    console.error('Error registering editor:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
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
        const token = jwt.sign({ iusername: editor.username, role: 'editor' }, 'rahul', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', editor, token });
    } catch (err) {
        console.error('Error logging in Editor', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const uploadVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const workspaceId = parseInt(req.params.workspaceId); // Parse workspaceId as an integer
    if (isNaN(workspaceId)) {
      res.status(400).json({ error: 'Invalid workspaceId' });
      return 
    }
    // const editorId = parseInt(req.params.editorId); // Parse editorId as an integer
    // if (isNaN(editorId)) {
    //   res.status(400).json({ error: 'Invalid editorId' });
    //   return 
    //}
    const s3 = new aws.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
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
          videoFile: key,
          status: "PENDING", // Store the S3 key in the database
          editorId: parseInt(editorId),
          workspaceId: workspaceId, // Associate content with the specified workspace
        },
      });

      console.log(key);
      res.status(201).json({ message: 'Video uploaded successfully', content: uploadedContent });
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
};

  // const uploadToWorkSpace = async (req: Request, res: Response) => {
  //   try {
  //     const  {workspaceId }  = req.params;
  //     const {editorId}  = req.params;
  //     const { videoTitle, videoDescription} = req.body;
      
  //     const s3 = new aws.S3({
  //      accessKeyId:process.env.AWS_ACCESS_KEY_ID,
  //      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  //     });
  //     // Set the editor ID in res.locals
  //     // Check if workspace exists
  //     const workspace = await prisma.workspace.findUnique({
  //       where: { id: parseInt(workspaceId)} ,
  //       include: { host: true }
  //     });
  //     if (!workspace) {
  //       return res.status(404).json({ error: 'Workspace not found' });
  //     }
  
  //     // Check if editor is authorized to upload in this workspace
  //     // For simplicity, you can check if the editor ID matches the one associated with the workspace
  //      // Retrieve the editorId from res.locals
     
  //     // Create a multer instance for handling file uploads
  //     const upload = multer({
  //       storage: multer.memoryStorage(), // Store files in memory before uploading to S3
  //       limits: {
  //         fileSize:   1024 * 1024 * 1024, // Maximum file size (2GB)
  //       },
  //     }).single('video'); // Specify the field name for the uploaded file
  
  //     // Handle file upload using multer
  //     upload(req, res, async (err: any) => {
  //       if (err) {
  //         console.error('Error uploading file:', err);
  //         return res.status(500).json({ error: 'Failed to upload file' });
  //       }
      
  //       // Check if req.file exists
  //       if (!req.file) {
  //         return res.status(400).json({ error: 'No file uploaded' });
  //       }
      
  //       // Generate a unique key for the file in S3
  //       const key = `videos/${uuidv4()}-${req.file.originalname}`;
      
  //       // Upload file to AWS S3 bucket
  //       const params = {
  //         Bucket: process.env.AWS_S3_BUCKET_NAME!,
  //         Key: key,
  //         Body: req.file.buffer,
  //       };
      
  //       await s3.upload(params).promise();
      
  //       // Save the uploaded file details to the database
  //       const uploadedContent = await prisma.content.create({
  //         data: {
  //           title: videoTitle,
  //           description: videoDescription,
  //           videoFile: key,
  //           status: 'PENDING', // Store the S3 key in the database
  //           editor: { connect: { id: editorId } }, // Connect the editor using the fetched editorId
  //           workspace: { connect: { id: parseInt(workspaceId) } },
  //         },
  //       });
      
  //       res.status(201).json({ message: 'Video uploaded successfully', content: uploadedContent });
  //     });
  //   } catch (error) {
  //     console.error('Error uploading video:', error);
  //     res.status(500).json({ error: 'Failed to upload video' });
  //   }
  // };
  const checkWorkspace = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract workspaceId from request parameters
        const { workspaceId } = req.params;

        // Query the database to check if the workspace exists
        const workspace = await prisma.workspace.findUnique({
            where: {
                id: parseInt(workspaceId) // Assuming workspace ID is numeric
            }
        });

        // If workspace exists, return success response
        if (workspace) {
            res.status(200).json({ message: 'Workspace found', workspace });
        } else {
            // If workspace does not exist, return not found response
            res.status(404).json({ error: 'Workspace not found' });
        }
    } catch (error) {
        console.error('Error checking workspace:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
  
  
export { registerEditor,getEditor, loginEditor, uploadVideo, checkWorkspace };
