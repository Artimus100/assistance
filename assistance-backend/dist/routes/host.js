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
exports.createKey = exports.loginHost = exports.registerHost = exports.getAllHosts = void 0;
const client_1 = require("@prisma/client");
// import session from 'express-session';
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
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
