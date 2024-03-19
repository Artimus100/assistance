import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
// import session from 'express-session';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { google } from 'googleapis';
import { S3 } from 'aws-sdk';




const prisma = new PrismaClient();
const OAuth2Client = google.auth.OAuth2;


const oauth2Client = new OAuth2Client({
    clientId: '975807587258-1b81eb7ktm6fri0e99rlmm5png3k6i61.apps.googleusercontent.com',
    clientSecret: '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',
    redirectUri: 'http://localhost:3000/oauth2callback',
  });
  const initiateOAuth2Authorization=function (req: Request, res: Response): void {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/youtube.upload'],
    });
    res.redirect(authUrl);
  }

 const handleOAuth2Callback= async function (req: Request, res: Response): Promise<void> {
    const code: string | undefined = req.query.code as string | undefined;
    if (!code) {
      res.status(400).send('Missing authorization code');
      return;
    }
  
    try {
      const { tokens } = await oauth2Client.getToken(code);
      // Do something with the tokens
      res.redirect('/success');
    } catch (error: any) {
      console.error('Error retrieving tokens:', error);
      res.status(500).send('Failed to retrieve tokens');
    }
  }
const generateRandomString = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

const getAllHosts = async (req: Request, res: Response): Promise<void> => {
    try {
         const host = await prisma.host.findMany({
            select: {
                username: true,
              },
        
         }); // Assuming 'host' is the name of your Prisma model
        res.status(200).json(host);
    } catch (err) {
        console.error('Error fetching hosts', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const registerHost = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, firstname, lastname, password } = req.body;
  
      // Check if the username already exists
      const existingHost = await prisma.host.findUnique({ where: { username } });
      if (existingHost) {
        // Username already exists, handle the error or notify the user
        res.status(400).json({ error: 'Username already exists' });
        return;
      }
  
      // Proceed with host creation since the username is unique
      const hashedPassword = await bcrypt.hash(password, 10);
      const host = await prisma.host.create({
        data: {
          username,
          firstname,
          lastname,
          password: hashedPassword,
        },
      });
  
      res.status(201).json(host);
    } catch (error) {
      console.error('Error registering host:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

// Log in a host
const loginHost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;
        const host = await prisma.host.findUnique({
            where: {
                username,
            },
        });

        if (!host) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, host.password);
        if (!passwordMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Generate JWT token
        const token = jwt.sign({ id: host.id, email: host.username }, 'your_secret_key', { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (err) {
        console.error('Error logging in host', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
// const createKey = (): { clientId: string; clientSecret: string } => {
//     const oauth2Client = new google.auth.OAuth2();

//     // Generate a unique client ID and client secret
//     const clientId = oauth2Client.generateAuthUrl({
//         access_type: 'offline',
//         scope: [
//             'https://www.googleapis.com/auth/youtube',
//             'https://www.googleapis.com/auth/youtube.upload'
//         ]
//     });
//     const clientSecret = generateRandomString(10);
    
//     console.log(clientSecret);
//     return { clientId, clientSecret };
// };
const createKey = async (hostId: number): Promise<{ clientId: string; clientSecret: string }> => {
    try {
        // Generate a unique client secret
        const clientSecret = generateRandomString(10);

        // Save the generated keys to the database
        const savedKeys = await prisma.oauth2credential.create({
            data: {
                clientId: '975807587258-1b81eb7ktm6fri0e99rlmm5png3k6i61.apps.googleusercontent.com', // Replace with your actual client ID
                clientSecret,
                hostId
            },
        });

        console.log(savedKeys);

        return savedKeys;
    } catch (error) {
        console.error('Error creating OAuth2 keys:', error);
        throw error;
    }
};
async function uploadVideoToYouTube(videoKey: string, metadata: any): Promise<any> {
    // Initialize S3 client
    const s3 = new S3();
  
    // Get the video file from AWS S3
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: videoKey, // The key (path) of the video file in the S3 bucket
    };
  
    const { Body } = await s3.getObject(params).promise();
  
    // Upload the video to YouTube
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const res = await youtube.videos.insert({
      requestBody: {
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
        },
        status: {
          privacyStatus: 'public', // Change as needed
        },
      },
      media: {
        body: Body,
      },
      part: ['snippet', 'status'], // Pass parts as an array of strings
    });
  
    return res.data;
  }
  const workspace = async (req:Request, res:Response): Promise<any>=>{
    try {
      
      const { hostId, editorId } = req.body;
      const parsedHostId = parseInt(hostId, 10);
        const parsedEditorId = parseInt(editorId, 10)

      // Check if host exists
      const host = await prisma.host.findUnique({
        where: {
            id: parsedHostId,
        },
    });
      if (!host) {
        return res.status(404).json({ error: 'Host not found' });
      }
      const EditorId = parseInt(req.body.editorId, 10);

      // Check if editor exists
      const editor = await prisma.editor.findUnique({
        where: {
            id: parsedEditorId,
        },
    });
      if (!editor) {
        return res.status(404).json({ error: 'Editor not found' });
      }
      res.locals.editorId = editorId;//stores the editor id in locals
      // Create workspace
      const workspace = await prisma.workspace.create({
        data: {
          host: { connect: { id: hostId } },
          editor: { connect: { id: editorId } }
        }
      });
  
      res.json(workspace);
    } catch (error) {
      console.error('Error creating workspace:', error);
      res.status(500).json({ error: 'Failed to create workspace' });
    }
  };
  


export {getAllHosts, registerHost, loginHost, createKey, uploadVideoToYouTube, initiateOAuth2Authorization, handleOAuth2Callback, workspace}