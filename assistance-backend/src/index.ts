const express = require("express");
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';


const cors = require("cors");
// import session from 'express-session';


// import {hostRouter} from './routes/host';
// import editorRouter from './routes/editor';
import { registerEditor } from './routes/editor';
import { loginEditor } from './routes/editor';
import  {getEditor}  from './routes/editor';
import { uploadVideo } from './routes/editor';// Import your route handler function

//imports from the host route
import { getAllHosts } from './routes/host';
import { registerHost } from './routes/host';
import { loginHost } from './routes/host';
import { createKey } from './routes/host';
//  import { oAuth2Credentials } from './routes/host'




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
  



// // Start the server
app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});