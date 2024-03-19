const express = require("express");
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import aws from 'aws-sdk';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';




const cors = require("cors");
// import session from 'express-session';


// import {hostRouter} from './routes/host';
// import editorRouter from './routes/editor';
import { registerEditor } from './routes/editor';
import { loginEditor } from './routes/editor';
import  {getEditor}  from './routes/editor';
// { uploadVideo } from './routes/editor';// Import your route handler function

//imports from the host route
import { getAllHosts, workspace } from './routes/host';
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

// // Define your routes
app.get('/editors', getEditor);
app.post('/registerEditor', registerEditor);
app.post('/loginEditor', loginEditor);


//Routes for hosts
app.get('/hosts', getAllHosts);
app.post('/register', registerHost);
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
// app.post("/uploadVideo", uploadVideo);
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
// // Start the server
app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});