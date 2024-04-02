"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const client_s3_1 = require("@aws-sdk/client-s3");
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors = require("cors");
// import session from 'express-session';
// import {hostRouter} from './routes/host';
// import editorRouter from './routes/editor';
const editor_1 = require("./routes/editor");
const editor_2 = require("./routes/editor");
const editor_3 = require("./routes/editor");
// { uploadVideo } from './routes/editor';// Import your route handler function
//imports from the host route
const host_1 = require("./routes/host");
const host_2 = require("./routes/host");
const host_3 = require("./routes/host");
const host_4 = require("./routes/host");
//  import { oAuth2Credentials } from './routes/host'
//uploadVideoToYouTube, initiateOAuth2Authorization, handleOAuth2Callback
const host_5 = require("./routes/host");
const host_6 = require("./routes/host");
const host_7 = require("./routes/host");
const app = express();
const prisma = new client_1.PrismaClient();
app.use(cors());
app.use(express.json());
const secretKey = 'rahul';
const authenticateToken = (req, res, next) => {
    // Get the token from the request headers
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        res.status(401).json({ error: 'Token is missing' });
        return;
    }
    // Extract the actual token from the authorization header
    const token = authHeader.split(' ')[1];
    // Verify the JWT token
    jsonwebtoken_1.default.verify(token, secretKey, (err, decoded) => {
        if (err) {
            res.status(403).json({ error: 'Invalid token' });
            return;
        }
        // Check the decoded payload to determine the role
        const { username, role } = decoded;
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
// // Define your routes
app.get('/editors', editor_3.getEditor);
app.post('/registerEditor', editor_1.registerEditor);
app.post('/loginEditor', editor_2.loginEditor);
// app.post('/editor/workspace/:workspaceId/upload-video', uploadToWorkSpace);
app.post("/workspace/:workspaceId/:editorId/uploadVideo", editor_1.uploadVideo);
app.get('/editor/workspace/:workspaceId', editor_1.checkWorkspace);
//Routes for hosts
app.get('/hosts', host_1.getAllHosts);
app.post('/hosts/register', host_2.registerHost);
app.get('/hosts/workspaces/:hostUsername', host_1.getAllWorkspaces);
app.get("hosts/workspaces/:hostUsername/:workspaceId", host_1.hostEnterWorkspace);
app.get('/hosts/Dashboard', authenticateToken, (req, res) => {
    try {
        // Access the authenticated user role from req.userRole
        const userRole = req.userRole;
        if (userRole === 'host') {
            // If user is host, allow access to the protected route
            res.status(200).json({ message: 'Welcome, host!' });
        }
        else {
            // If user is not host, deny access to the protected route
            res.status(403).json({ error: 'Access forbidden' });
        }
    }
    catch (error) {
        console.error('Error accessing dashboard:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/getAllvideoKeys', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const videoKeys = yield (0, host_1.getAllVideoKeys)();
        res.status(200).json({ videoKeys });
    }
    catch (error) {
        console.error('Error fetching video keys:', error);
        res.status(500).json({ error: 'Failed to fetch video keys' });
    }
}));
app.post('/hosts/createKeys', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Assuming hostId is sent in the request body
        const { hostId } = req.body;
        if (!hostId) {
            return res.status(400).json({ error: 'hostId is required' });
        }
        const { clientId, clientSecret } = yield (0, host_4.createKey)(hostId); // Pass hostId to createKey function
        res.status(200).json({ clientId, clientSecret }); // Send the generated keys as JSON response
    }
    catch (error) {
        console.error('Error creating keys:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
//  app.post('/getKeys', oAuth2Credentials)
// Route for logging in a host
app.post('/hosts/login', host_3.loginHost);
// Route to fetch uploaded videos awaiting approval
// Route to approve a video for publishing
app.post('/hosts/approve/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Check if the video record exists
        const existingVideo = yield prisma.content.findUnique({
            where: { id: parseInt(id) },
        });
        if (!existingVideo) {
            return res.status(404).json({ error: 'Video not found' });
        }
        // Update the status of the video to approved
        const approvedVideo = yield prisma.content.update({
            where: { id: parseInt(id) },
            data: { status: 'APPROVED' },
        });
        res.status(200).json({ message: 'Video approved successfully', video: approvedVideo });
    }
    catch (error) {
        console.error('Error approving video:', error);
        res.status(500).json({ error: 'Failed to approve video' });
    }
}));
// Route to reject a video
app.post('/hosts/reject/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Check if the video record exists
        const existingVideo = yield prisma.content.findUnique({
            where: { id: parseInt(id) },
        });
        if (!existingVideo) {
            return res.status(404).json({ error: 'Video not found' });
        }
        // Update the status of the video to rejected
        const rejectedVideo = yield prisma.content.update({
            where: { id: parseInt(id) },
            data: { status: 'REJECTED' },
        });
        res.status(200).json({ message: 'Video rejected successfully', video: rejectedVideo });
    }
    catch (error) {
        console.error('Error rejecting video:', error);
        res.status(500).json({ error: 'Failed to reject video' });
    }
}));
app.get('/hosts/authorize', host_6.initiateOAuth2Authorization);
app.get('/oauth2callback', host_7.handleOAuth2Callback);
const s3 = new aws_sdk_1.default.S3({
    // Configure your AWS credentials and region
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
const s3Client = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
});
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3Client, // Use S3Client instance here
        bucket: process.env.AWS_S3_BUCKET_NAME,
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file.originalname);
        },
    }),
});
;
// app.post('/upload', upload.single('videoFile'), async (req:Request, res:Response) => {
//   // Check if req.file exists and has the key property
//   if (!req.file || !(req.file as CustomFile).key) {
//     res.status(400).json({ error: 'Video file is missing or invalid' });
//     return;
//   }
//   // Assuming you're handling metadata in req.body
//   const metadata = req.body;
//   try {
//     const videoKey = (req.file as CustomFile).key;
//     const uploadedVideo = await uploadVideoToYouTube(videoKey, metadata);
//     res.status(200).json({ message: 'Video uploaded successfully', video: uploadedVideo });
//   } catch (error) {
//     console.error('Error uploading video to YouTube:', error);
//     res.status(500).json({ error: 'Failed to upload video to YouTube' });
//   }
// });
app.post("/hosts/workspace", host_1.workspace);
app.post('/workspace/:workspaceId/upload', host_5.uploadVideoToYouTube);
app.get('/auth', (req, res) => {
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
app.get('/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authorizationCode = req.query.code;
    try {
        // Exchange the authorization code for access tokens
        const tokenResponse = yield exchangeAuthorizationCode(authorizationCode);
        // Log the authorization code and tokens
        console.log('Authorization code:', authorizationCode);
        console.log('Token response:', tokenResponse.data);
        // Here you can handle the received access token or do any other necessary actions
        // For example, you can save the access token to use it for subsequent API requests
        res.send('Authorization code exchanged successfully');
    }
    catch (error) {
        console.error('Error exchanging authorization code for tokens:', error);
        res.status(500).json({ error: 'Failed to exchange authorization code for tokens' });
    }
}));
app.get("/streamVideo/:key", host_1.streamVideo);
function exchangeAuthorizationCode(authorizationCode) {
    return __awaiter(this, void 0, void 0, function* () {
        // Make a request to the authorization server's token endpoint to exchange the code for tokens
        // You'll need to use a library like axios or node-fetch for making HTTP requests
        // Example using axios:
        const tokenResponse = yield axios_1.default.post('https://oauth2.googleapis.com/token', {
            grant_type: 'authorization_code',
            code: authorizationCode,
            client_id: '975807587258-1b81eb7ktm6fri0e99rlmm5png3k6i61.apps.googleusercontent.com',
            client_secret: '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',
            redirect_uri: 'http://localhost:3000/callback'
        });
        return tokenResponse;
    });
}
// // Start the server
app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});
