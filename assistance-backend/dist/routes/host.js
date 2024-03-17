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
exports.handleOAuth2Callback = exports.initiateOAuth2Authorization = exports.uploadVideoToYouTube = exports.createKey = exports.loginHost = exports.registerHost = exports.getAllHosts = void 0;
const client_1 = require("@prisma/client");
// import session from 'express-session';
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const googleapis_1 = require("googleapis");
const aws_sdk_1 = require("aws-sdk");
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
            res.redirect('/success');
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
        const host = yield prisma.host.create({
            data: {
                username,
                firstname,
                lastname,
                password: hashedPassword,
            },
        });
        res.status(201).json(host);
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
            where: {
                username,
            },
        });
        if (!host) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, host.password);
        if (!passwordMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: host.id, email: host.username }, 'your_secret_key', { expiresIn: '1h' });
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
        const clientSecret = generateRandomString(10);
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
function uploadVideoToYouTube(videoKey, metadata) {
    return __awaiter(this, void 0, void 0, function* () {
        // Initialize S3 client
        const s3 = new aws_sdk_1.S3();
        // Get the video file from AWS S3
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: videoKey, // The key (path) of the video file in the S3 bucket
        };
        const { Body } = yield s3.getObject(params).promise();
        // Upload the video to YouTube
        const youtube = googleapis_1.google.youtube({ version: 'v3', auth: oauth2Client });
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
        return res.data;
    });
}
exports.uploadVideoToYouTube = uploadVideoToYouTube;
