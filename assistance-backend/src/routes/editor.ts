import { Request, Response } from 'express';
import pool from '../db/index'; // Import your database connection
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
// Example route handler

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getEditor = async (req: Request, res: Response): Promise<void> => {
    try {
        const editor = await prisma.editor.findMany(); // Using Prisma to fetch all users
        res.json(editor);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const registerEditor = async (username: string, password: string, firstname: string, lastname: string): Promise<void> =>{
    try {
        await prisma.editor.create({
            data: {
                username: username,
                password: password,
                firstname: firstname,
                lastname: lastname,
            },
        });
    } catch (error) {
        console.error('Error registering editor:', error);
        throw new Error('Failed to register editor');
    }
}
const loginEditor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body; // Assuming you have these fields in your request body
        const editor = await prisma.editor.findUnique({
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
        const passwordMatch = await bcrypt.compare(password, editor.password);
        if (!passwordMatch) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const token = jwt.sign({ id: editor.id, email: editor.username }, 'your_secret_key', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', editor, token });
    } catch (err) {
        console.error('Error logging in Editor', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


export { registerEditor,getEditor, loginEditor };
