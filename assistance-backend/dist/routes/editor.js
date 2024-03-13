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
exports.uploadVideo = exports.loginEditor = exports.getEditor = exports.registerEditor = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const multer_1 = __importDefault(require("multer"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const uuid_1 = require("uuid");
// Example route handler
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getEditor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const editor = yield prisma.editor.findMany(); // Using Prisma to fetch all users
        res.json(editor);
    }
    catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.getEditor = getEditor;
const registerEditor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, firstname, lastname } = req.body;
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const editor = yield prisma.editor.create({
            data: {
                username,
                password: hashedPassword,
                firstname,
                lastname,
            },
        });
        res.status(500).json(editor);
    }
    catch (error) {
        console.error('Error registering editor:', error);
        throw new Error('Failed to register editor');
    }
});
exports.registerEditor = registerEditor;
// onst registerHost = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { username, firstname, lastname, password } = req.body;
//         const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
//         const host = await prisma.host.create({
//             data: {
//                 username,
//                 firstname,
//                 lastname,
//                 password: hashedPassword,
//             },
//         });
//         res.status(201).json(host);
//     } catch (err) {
//         console.error('Error registering host', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };
const loginEditor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body; // Assuming you have these fields in your request body
        const editor = yield prisma.editor.findUnique({
            where: {
                username,
            },
        });
        if (!editor) {
            res.status(404).json({ error: 'Editor not found' });
            return;
        }
        // Here you should validate the password against the stored hashed password
        // For simplicity, we're just comparing plain text passwords
        const passwordMatch = yield bcrypt_1.default.compare(password, editor.password);
        if (!passwordMatch) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: editor.id, email: editor.username }, 'your_secret_key', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', editor, token });
    }
    catch (err) {
        console.error('Error logging in Editor', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.loginEditor = loginEditor;
const uploadVideo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const s3 = new aws_sdk_1.default.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: "ZFlCKO55muw8SADluVPECzXqwuuIYD39xoO4zoRv",
        });
        // Create a multer instance for handling file uploads
        const upload = (0, multer_1.default)({
            storage: multer_1.default.memoryStorage(), // Store files in memory before uploading to S3
            limits: {
                fileSize: 1024 * 1024 * 1024, // Maximum file size (1GB)
            },
        }).single('video'); // Specify the field name for the uploaded file
        // Handle file upload using multer
        upload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error('Error uploading file:', err);
                return res.status(500).json({ error: 'Failed to upload file' });
            }
            // Check if req.file exists
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            const { title, description, editorId } = req.body;
            // Generate a unique key for the file in S3
            const key = `videos/${(0, uuid_1.v4)()}-${req.file.originalname}`;
            // Upload file to AWS S3 bucket
            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: key,
                Body: req.file.buffer,
            };
            yield s3.upload(params).promise();
            // Save the uploaded file details to the database
            const uploadedContent = yield prisma.content.create({
                data: {
                    title,
                    description,
                    videoFile: key, // Store the S3 key in the database
                    editorId: parseInt(editorId),
                },
            });
            res.status(201).json({ message: 'Video uploaded successfully', content: uploadedContent });
        }));
    }
    catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ error: 'Failed to upload video' });
    }
});
exports.uploadVideo = uploadVideo;
