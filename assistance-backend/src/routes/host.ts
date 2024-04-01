import { Request, Response,NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
// import session from 'express-session';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { google } from 'googleapis';
import { S3 } from 'aws-sdk';
import aws from 'aws-sdk';





const prisma = new PrismaClient();
const OAuth2Client = google.auth.OAuth2;
declare global {
  namespace Express {
    interface Request {
      userRole: 'host' | 'editor';
    }
  }
}


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
      res.redirect('/callback');
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
    const createdHost = await prisma.host.create({
      data: {
        username,
        firstname,
        lastname,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ username, role: 'host' }, secretKey, { expiresIn: '1h' });

    // Respond with token and host data
    res.status(201).json({ host: createdHost, token });
  } catch (error) {
    console.error('Error registering host:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
interface JwtPayload {
  username: string;
  role: 'host'; // Assuming it's always 'host' for loginHost
}
// Log in a host
const loginHost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const host = await prisma.host.findUnique({
      where: { username },
    });

    if (!host || !(await bcrypt.compare(password, host.password))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token with username and role only
    const token = jwt.sign(
      { username: host.username, role: 'host' } as JwtPayload,
      secretKey,
      { expiresIn: '1h' }
    );

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
        const clientSecret = "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";

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
// async function uploadVideoToYouTube(videoKey: string, metadata: any): Promise<any> {
//     // Initialize S3 client
//     const s3 = new S3();
  
//     // Get the video file from AWS S3
//     const params = {
//         Bucket: process.env.AWS_S3_BUCKET_NAME!,
//         Key: videoKey, // The key (path) of the video file in the S3 bucket
//     };
  
//     const { Body } = await s3.getObject(params).promise();
  
//     // Upload the video to YouTube
//     const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
//     const res = await youtube.videos.insert({
//       requestBody: {
//         snippet: {
//           title: metadata.title,
//           description: metadata.description,
//           tags: metadata.tags,
//         },
//         status: {
//           privacyStatus: 'public', // Change as needed
//         },
//       },
//       media: {
//         body: Body,
//       },
//       part: ['snippet', 'status'], // Pass parts as an array of strings
//     });
  
//     return res.data;
// }
//   const uploadVideoToYouTube = async (videoKey: string, metadata: any): Promise<any> => {
//     // Initialize S3 client
//     const s3 = new S3();

//     // Ensure videoKey is a string
//     const key = String(videoKey);

//     // Get the video file from AWS S3
//     const params = {
//         Bucket: process.env.AWS_S3_BUCKET_NAME!,
//         Key: key, // Ensure key is a string
//     };

//     const { Body } = await s3.getObject(params).promise();

//     // Upload the video to YouTube
//     const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
//     const res = await youtube.videos.insert({
//         requestBody: {
//             snippet: {
//                 title: metadata.title,
//                 description: metadata.description,
//                 tags: metadata.tags,
//             },
//             status: {
//                 privacyStatus: 'public', // Change as needed
//             },
//         },
//         media: {
//             body: Body,
//         },
//         part: ['snippet', 'status'], // Pass parts as an array of strings
//     });

//     return res.data;
// };
const uploadVideoToYouTube = async (videoKey:string, metadata:any) => {
  try {
      // Initialize S3 client
      const s3 = new S3();

      // Get the video file from AWS S3
      const params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: videoKey,
      };
      const { Body } = await s3.getObject(params).promise();

      // Authenticate with YouTube Data API
      const oauth2Client = new google.auth.OAuth2(
          process.env.YOUTUBE_CLIENT_ID,
          process.env.YOUTUBE_CLIENT_SECRET,
          process.env.YOUTUBE_REDIRECT_URI
      );

      // Set credentials for the OAuth2 client
      oauth2Client.setCredentials({
          access_token: process.env.YOUTUBE_ACCESS_TOKEN,
          refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
          // Optional: expiry_date, token_type
      });

      // Create a YouTube client
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      // Upload the video to YouTube
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

      // Return the response data
      return res.data;
  } catch (error) {
      console.error('Error uploading video to YouTube:', error);
      throw error;
  }
};
const workspace = async (req: Request, res: Response): Promise<any> => {
    try {
        const { hostId, editorId, name } = req.body;

        // Parse hostId and editorId to integers
        const parsedHostId = parseInt(hostId, 10);
        const parsedEditorId = parseInt(editorId, 10);

        // Check if host exists
        const host = await prisma.host.findUnique({
            where: {
                id: parsedHostId,
            },
        });

        if (!host) {
            return res.status(404).json({ error: 'Host not found' });
        }

        // Check if editor exists
        const editor = await prisma.editor.findUnique({
            where: {
                id: parsedEditorId,
            },
        });

        if (!editor) {
            return res.status(404).json({ error: 'Editor not found' });
        }

        // Create workspace
        const workspace = await prisma.workspace.create({
            data: {
                host: { connect: { id: parsedHostId } },
                editor: { connect: { id: parsedEditorId } },
                name:name,
            }
        });

        res.json(workspace);
    } catch (error) {
        console.error('Error creating workspace:', error);
        res.status(500).json({ error: 'Failed to create workspace' });
    }
};

// Function to generate JWT token for the host
const secretKey = 'rahul';

// Middleware to authenticate JWT token
 const generateToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.body;

    // Create payload for the JWT token
    const payload = {
      username,
      role: 'host', // Assuming the role is 'host' for this example
    };

    // Generate JWT token with payload and secret key
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' }); // Token expires in 1 hour

    // Send the token in the response
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
// const authenticateToken = (req: Request, res: Response, next: NextFunction): any => {
//   // Get the token from the request headers
//   const authHeader = req.headers.authorization;
  
//   if (!authHeader) {
//     return res.status(401).json({ error: 'Token is missing' });
//   }

//   // Extract the actual token from the authorization header
//   const token = authHeader.split(' ')[1]; // Split the authorization header and get the token part

//   // Verify the JWT token
//   jwt.verify(token, secretKey, (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ error: 'Invalid token' });
//     }

//     // Check the decoded payload to determine the role
//     const { username, role } = decoded as { username: string; role: string };
//     if (role === 'host') {
//       // If the role is 'host', set the user role in the request object
//       req.userRole = 'host';
//     } else {
//       // If the role is not 'host', set the user role as 'editor' by default
//       req.userRole = 'editor';
//     }

//     // Move to the next middleware
//     next();
//   });
// };

const getAllWorkspaces = async (req: Request, res: Response): Promise<void> => {
  try {
      const { hostUsername } = req.params;

      // Find the host by username
      const host = await prisma.host.findUnique({
          where: {
              username: hostUsername,
          },
          include: {
              workspaces: true,
          },
      });

      if (!host) {
          res.status(404).json({ error: 'Host not found' });
          return;
      }

      // Extract the workspaces from the host
      const workspaces = host.workspaces;

      res.status(200).json(workspaces);
  } catch (err) {
      console.error('Error fetching workspaces by host:', err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Configure AWS SDK
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Function to stream video from S3 bucket
const streamVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the video key from request parameters
    const { key } = req.params;

    // Create a read stream from the S3 object
    const s3Stream = s3.getObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
    }).createReadStream();

    // Set content type as video/mp4 (modify according to your video format)
    res.setHeader('Content-Type', 'video/mp4');

    // Pipe the read stream to response
    s3Stream.pipe(res);
  } catch (error) {
    console.error('Error streaming video:', error);
    res.status(500).json({ error: 'Failed to stream video' });
  }
};
const hostEnterWorkspace = async (req: Request, res: Response): Promise<void> => {
}

  


export {getAllHosts, registerHost, loginHost, createKey, uploadVideoToYouTube, initiateOAuth2Authorization, handleOAuth2Callback, workspace,generateToken, streamVideo, getAllWorkspaces,hostEnterWorkspace}