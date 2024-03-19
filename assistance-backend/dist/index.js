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
// app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
// app.use("/host", hostRouter);
// app.use("/editor", editorRouter);
// app.listen(3001, ()=>console.log("running properlu"));
// const express = require("express");
// const app = express();
// Set your desired port
// // Define your routes
app.get('/editors', editor_3.getEditor);
app.post('/registerEditor', editor_1.registerEditor);
app.post('/loginEditor', editor_2.loginEditor);
//Routes for hosts
app.get('/hosts', host_1.getAllHosts);
app.post('/register', host_2.registerHost);
app.post('/createKeys', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
// app.post("/uploadVideo", uploadVideo);
//  app.post('/getKeys', oAuth2Credentials)
// Route for logging in a host
app.post('/login', host_3.loginHost);
// Route to fetch uploaded videos awaiting approval
// Route to approve a video for publishing
app.post('/approve/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
app.post('/reject/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
app.get('/authorize', host_6.initiateOAuth2Authorization);
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
app.post('/upload', upload.single('videoFile'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if req.file exists and has the key property
    if (!req.file || !req.file.key) {
        res.status(400).json({ error: 'Video file is missing or invalid' });
        return;
    }
    // Assuming you're handling metadata in req.body
    const metadata = req.body;
    try {
        const videoKey = req.file.key;
        const uploadedVideo = yield (0, host_5.uploadVideoToYouTube)(videoKey, metadata);
        res.status(200).json({ message: 'Video uploaded successfully', video: uploadedVideo });
    }
    catch (error) {
        console.error('Error uploading video to YouTube:', error);
        res.status(500).json({ error: 'Failed to upload video to YouTube' });
    }
}));
app.post("/workspace", host_1.workspace);
app.post('/workspace/:workspaceId/upload', host_5.uploadVideoToYouTube);
// // Start the server
app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});
