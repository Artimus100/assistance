const express = require("express");
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import aws from 'aws-sdk';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import axios, { AxiosResponse } from 'axios';
import { OAuth2Client } from 'google-auth-library';
import {  NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';






const cors = require("cors");
// import session from 'express-session';


// import {hostRouter} from './routes/host';
// import editorRouter from './routes/editor';
import { registerEditor, uploadVideo } from './routes/editor';
import { loginEditor } from './routes/editor';
import  {getEditor}  from './routes/editor';
// { uploadVideo } from './routes/editor';// Import your route handler function

//imports from the host route
import {generateToken, getAllHosts, workspace } from './routes/host';
import { registerHost } from './routes/host';
import { loginHost } from './routes/host';
import { createKey } from './routes/host';
//  import { oAuth2Credentials } from './routes/host'
//uploadVideoToYouTube, initiateOAuth2Authorization, handleOAuth2Callback
import { uploadVideoToYouTube } from './routes/host';
import {initiateOAuth2Authorization} from './routes/host';
import { handleOAuth2Callback } from './routes/host';





const app = express();
const prisma = new PrismaClient();


 

app.use(cors());
app.use(express.json());
// app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));

// app.use("/host", hostRouter);
// app.use("/editor", editorRouter);

// app.listen(3001, ()=>console.log("running properlu"));
// const express = require("express");

// const app = express();
 // Set your desired port
 interface TokenResponseData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  // Add any other properties you expect in the token response
}
// // Define your routes
app.get('/editors', getEditor);
app.post('/registerEditor', registerEditor);
app.post('/loginEditor', loginEditor);


//Routes for hosts
app.get('/hosts', getAllHosts);
app.post('/register', registerHost);
const secretKey = 'rahul';

const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // Get the token from the request headers
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    res.status(401).json({ error: 'Token is missing' });
    return;
  }

  // Extract the actual token from the authorization header
  const token = authHeader.split(' ')[1];

  // Verify the JWT token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }

    // Check the decoded payload to determine the role
    const { username, role } = decoded as { username: string; role: 'host' | 'editor' };
    if (!username || !role) {
      res.status(403).json({ error: 'Invalid token payload' });
      return;
    }

    // Set the user role in the request object
    req.userRole = role;

    // Move to the next middleware
    next();
  });
};
app.get('/Dashboard', authenticateToken,  (req: Request, res: Response) => {
  try {
    // Access the authenticated user role from req.userRole
    const userRole = req.userRole;

    if (userRole === 'host') {
      // If user is host, allow access to the protected route
      res.status(200).json({ message: 'Welcome, host!' });
    } else {
      // If user is not host, deny access to the protected route
      res.status(403).json({ error: 'Access forbidden' });
    }
  } catch (error) {
    console.error('Error accessing dashboard:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.post('/createKeys', async (req: Request, res: Response) => {
    try {
        // Assuming hostId is sent in the request body
        const { hostId } = req.body;

        if (!hostId) {
            return res.status(400).json({ error: 'hostId is required' });
        }

        const { clientId, clientSecret } = await createKey(hostId); // Pass hostId to createKey function
        res.status(200).json({ clientId, clientSecret }); // Send the generated keys as JSON response
    } catch (error) {
        console.error('Error creating keys:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.post("/uploadVideo", uploadVideo);
//  app.post('/getKeys', oAuth2Credentials)

// Route for logging in a host
app.post('/login', loginHost);

// Route to fetch uploaded videos awaiting approval
// Route to approve a video for publishing
app.post('/approve/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
  
    try {
      // Check if the video record exists
      const existingVideo = await prisma.content.findUnique({
        where: { id: parseInt(id) },
      });
  
      if (!existingVideo) {
        return res.status(404).json({ error: 'Video not found' });
      }
  
      // Update the status of the video to approved
      const approvedVideo = await prisma.content.update({
        where: { id: parseInt(id) },
        data: { status: 'APPROVED' },
      });
  
      res.status(200).json({ message: 'Video approved successfully', video: approvedVideo });
    } catch (error) {
      console.error('Error approving video:', error);
      res.status(500).json({ error: 'Failed to approve video' });
    }
  });
  
  // Route to reject a video
  app.post('/reject/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
  
    try {
      // Check if the video record exists
      const existingVideo = await prisma.content.findUnique({
        where: { id: parseInt(id) },
      });
  
      if (!existingVideo) {
        return res.status(404).json({ error: 'Video not found' });
      }
  
      // Update the status of the video to rejected
      const rejectedVideo = await prisma.content.update({
        where: { id: parseInt(id) },
        data: { status: 'REJECTED' },
      });
  
      res.status(200).json({ message: 'Video rejected successfully', video: rejectedVideo });
    } catch (error) {
      console.error('Error rejecting video:', error);
      res.status(500).json({ error: 'Failed to reject video' });
    }
  });
  app.get('/authorize', initiateOAuth2Authorization);
  app.get('/oauth2callback', handleOAuth2Callback);
  const s3 = new aws.S3({
    // Configure your AWS credentials and region
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  const s3Client = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    region: process.env.AWS_REGION!,
  });
  const upload = multer({
    storage: multerS3({
      s3: s3Client, // Use S3Client instance here
      bucket: process.env.AWS_S3_BUCKET_NAME!,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      acl: 'public-read',
      key: function(req, file, cb) {
        cb(null, Date.now().toString() + '-' + file.originalname);
      },
    }),
  });;
  interface CustomFile extends Express.Multer.File {
    key: string;
  }
   
  app.post('/upload', upload.single('videoFile'), async (req:Request, res:Response) => {
    // Check if req.file exists and has the key property
    if (!req.file || !(req.file as CustomFile).key) {
      res.status(400).json({ error: 'Video file is missing or invalid' });
      return;
    }
  
    // Assuming you're handling metadata in req.body
    const metadata = req.body;
    
    try {
      const videoKey = (req.file as CustomFile).key;
      const uploadedVideo = await uploadVideoToYouTube(videoKey, metadata);
      res.status(200).json({ message: 'Video uploaded successfully', video: uploadedVideo });
    } catch (error) {
      console.error('Error uploading video to YouTube:', error);
      res.status(500).json({ error: 'Failed to upload video to YouTube' });
    }
  });

  app.post("/workspace", workspace);
  app.post('/workspace/:workspaceId/upload', uploadVideoToYouTube)


  app.get('/auth', (req: Request, res: Response) => {
    // Define the required scopes
    const scopes = ['openid', 'profile', 'email'].join(' ');
  
    // Redirect the user to the authorization server's authorization endpoint
    // Include necessary parameters like client ID, redirect URI, and scope
    const authorizationEndpoint = 'https://accounts.google.com/o/oauth2/auth';
    const clientId = '975807587258-1b81eb7ktm6fri0e99rlmm5png3k6i61.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:3000/callback';
  
    res.redirect(`${authorizationEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}`);
  });
  
  // Callback route to handle the authorization code sent by the authorization server
  app.get('/callback', async (req: Request, res: Response) => {
    const authorizationCode = req.query.code as string;
  
    try {
      // Exchange the authorization code for access tokens
      const tokenResponse = await exchangeAuthorizationCode(authorizationCode);
      
      // Log the authorization code and tokens
      console.log('Authorization code:', authorizationCode);
      console.log('Token response:', tokenResponse.data);
  
      // Here you can handle the received access token or do any other necessary actions
      // For example, you can save the access token to use it for subsequent API requests
      
      res.send('Authorization code exchanged successfully');
    } catch (error) {
      console.error('Error exchanging authorization code for tokens:', error);
      res.status(500).json({ error: 'Failed to exchange authorization code for tokens' });
    }
  });
  
  async function exchangeAuthorizationCode(authorizationCode: string) {
    // Make a request to the authorization server's token endpoint to exchange the code for tokens
    // You'll need to use a library like axios or node-fetch for making HTTP requests
    
    // Example using axios:
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      grant_type: 'authorization_code',
      code: authorizationCode,
      client_id: '975807587258-1b81eb7ktm6fri0e99rlmm5png3k6i61.apps.googleusercontent.com',
      client_secret: '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',
      redirect_uri: 'http://localhost:3000/callback'
    });
  
    return tokenResponse;
  }


// // Start the server
app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});