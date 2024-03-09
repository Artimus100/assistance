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
exports.loginEditor = exports.getEditor = exports.registerEditor = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
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
const registerEditor = (username, password, firstname, lastname) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.editor.create({
            data: {
                username: username,
                password: password,
                firstname: firstname,
                lastname: lastname,
            },
        });
    }
    catch (error) {
        console.error('Error registering editor:', error);
        throw new Error('Failed to register editor');
    }
});
exports.registerEditor = registerEditor;
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
