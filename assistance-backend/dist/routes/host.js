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
exports.hostEnterWorkspace = exports.getAllWorkspaces = exports.streamVideo = exports.generateToken = exports.workspace = exports.handleOAuth2Callback = exports.initiateOAuth2Authorization = exports.uploadVideoToYouTube = exports.createKey = exports.loginHost = exports.registerHost = exports.getAllHosts = void 0;
const client_1 = require("@prisma/client");
// import session from 'express-session';
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const googleapis_1 = require("googleapis");
const aws_sdk_1 = require("aws-sdk");
const aws_sdk_2 = __importDefault(require("aws-sdk"));
const prisma = new client_1.PrismaClient();
const OAuth2Client = googleapis_1.google.auth.OAuth2;
const oauth2Client = new OAuth2Client({
    clientId: '975807587258-1b81eb7ktm6fri0e99rlmm5png3k6i61.apps.googleusercontent.com',
    clientSecret: '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',
    redirectUri: 'http://localhost:3000/oauth2callback',
});
const initiateOAuth2Authorization = function (req, res) {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/youtube.upload'],
    });
    res.redirect(authUrl);
};
exports.initiateOAuth2Authorization = initiateOAuth2Authorization;
const handleOAuth2Callback = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const code = req.query.code;
        if (!code) {
            res.status(400).send('Missing authorization code');
            return;
        }
        try {
            const { tokens } = yield oauth2Client.getToken(code);
            // Do something with the tokens
            res.redirect('/callback');
        }
        catch (error) {
            console.error('Error retrieving tokens:', error);
            res.status(500).send('Failed to retrieve tokens');
        }
    });
};
exports.handleOAuth2Callback = handleOAuth2Callback;
const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
const getAllHosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const host = yield prisma.host.findMany({
            select: {
                username: true,
            },
        }); // Assuming 'host' is the name of your Prisma model
        res.status(200).json(host);
    }
    catch (err) {
        console.error('Error fetching hosts', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.getAllHosts = getAllHosts;
const registerHost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, firstname, lastname, password } = req.body;
        // Check if the username already exists
        const existingHost = yield prisma.host.findUnique({ where: { username } });
        if (existingHost) {
            // Username already exists, handle the error or notify the user
            res.status(400).json({ error: 'Username already exists' });
            return;
        }
        // Proceed with host creation since the username is unique
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const createdHost = yield prisma.host.create({
            data: {
                username,
                firstname,
                lastname,
                password: hashedPassword,
            },
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ username, role: 'host' }, secretKey, { expiresIn: '1h' });
        // Respond with token and host data
        res.status(201).json({ host: createdHost, token });
    }
    catch (error) {
        console.error('Error registering host:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.registerHost = registerHost;
// Log in a host
const loginHost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const host = yield prisma.host.findUnique({
            where: { username },
        });
        if (!host || !(yield bcrypt_1.default.compare(password, host.password))) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        // Generate JWT token with username and role only
        const token = jsonwebtoken_1.default.sign({ username: host.username, role: 'host' }, secretKey, { expiresIn: '1h' });
        res.status(200).json({ token });
    }
    catch (err) {
        console.error('Error logging in host', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.loginHost = loginHost;
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
const createKey = (hostId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Generate a unique client secret
        const clientSecret = "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";
        // Save the generated keys to the database
        const savedKeys = yield prisma.oauth2credential.create({
            data: {
                clientId: '975807587258-1b81eb7ktm6fri0e99rlmm5png3k6i61.apps.googleusercontent.com', // Replace with your actual client ID
                clientSecret,
                hostId
            },
        });
        console.log(savedKeys);
        return savedKeys;
    }
    catch (error) {
        console.error('Error creating OAuth2 keys:', error);
        throw error;
    }
});
exports.createKey = createKey;
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
const uploadVideoToYouTube = (videoKey, metadata) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Initialize S3 client
        const s3 = new aws_sdk_1.S3();
        // Get the video file from AWS S3
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: videoKey,
        };
        const { Body } = yield s3.getObject(params).promise();
        // Authenticate with YouTube Data API
        const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.YOUTUBE_CLIENT_ID, process.env.YOUTUBE_CLIENT_SECRET, process.env.YOUTUBE_REDIRECT_URI);
        // Set credentials for the OAuth2 client
        oauth2Client.setCredentials({
            access_token: process.env.YOUTUBE_ACCESS_TOKEN,
            refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
            // Optional: expiry_date, token_type
        });
        // Create a YouTube client
        const youtube = googleapis_1.google.youtube({ version: 'v3', auth: oauth2Client });
        // Upload the video to YouTube
        const res = yield youtube.videos.insert({
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
    }
    catch (error) {
        console.error('Error uploading video to YouTube:', error);
        throw error;
    }
});
exports.uploadVideoToYouTube = uploadVideoToYouTube;
const workspace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hostId, editorId, name } = req.body;
        // Parse hostId and editorId to integers
        const parsedHostId = parseInt(hostId, 10);
        const parsedEditorId = parseInt(editorId, 10);
        // Check if host exists
        const host = yield prisma.host.findUnique({
            where: {
                id: parsedHostId,
            },
        });
        if (!host) {
            return res.status(404).json({ error: 'Host not found' });
        }
        // Check if editor exists
        const editor = yield prisma.editor.findUnique({
            where: {
                id: parsedEditorId,
            },
        });
        if (!editor) {
            return res.status(404).json({ error: 'Editor not found' });
        }
        // Create workspace
        const workspace = yield prisma.workspace.create({
            data: {
                host: { connect: { id: parsedHostId } },
                editor: { connect: { id: parsedEditorId } },
                name: name,
            }
        });
        res.json(workspace);
    }
    catch (error) {
        console.error('Error creating workspace:', error);
        res.status(500).json({ error: 'Failed to create workspace' });
    }
});
exports.workspace = workspace;
// Function to generate JWT token for the host
const secretKey = 'rahul';
// Middleware to authenticate JWT token
const generateToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.body;
        // Create payload for the JWT token
        const payload = {
            username,
            role: 'host', // Assuming the role is 'host' for this example
        };
        // Generate JWT token with payload and secret key
        const token = jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn: '1h' }); // Token expires in 1 hour
        // Send the token in the response
        res.status(200).json({ token });
    }
    catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.generateToken = generateToken;
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
const getAllWorkspaces = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hostUsername } = req.params;
        // Find the host by username
        const host = yield prisma.host.findUnique({
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
    }
    catch (err) {
        console.error('Error fetching workspaces by host:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.getAllWorkspaces = getAllWorkspaces;
// Configure AWS SDK
const s3 = new aws_sdk_2.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
// Function to stream video from S3 bucket
const streamVideo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the video key from request parameters
        const { key } = req.params;
        // Create a read stream from the S3 object
        const s3Stream = s3.getObject({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
        }).createReadStream();
        // Set content type as video/mp4 (modify according to your video format)
        res.setHeader('Content-Type', 'video/mp4');
        // Pipe the read stream to response
        s3Stream.pipe(res);
    }
    catch (error) {
        console.error('Error streaming video:', error);
        res.status(500).json({ error: 'Failed to stream video' });
    }
});
exports.streamVideo = streamVideo;
const hostEnterWorkspace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.hostEnterWorkspace = hostEnterWorkspace;
