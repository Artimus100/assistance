import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
// import session from 'express-session';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { google } from 'googleapis';

const prisma = new PrismaClient();

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
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const host = await prisma.host.create({
            data: {
                username,
                firstname,
                lastname,
                password: hashedPassword,
            },
        });
        res.status(201).json(host);
    } catch (err) {
        console.error('Error registering host', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Log in a host
const loginHost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;
        const host = await prisma.host.findUnique({
            where: {
                username,
            },
        });

        if (!host) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, host.password);
        if (!passwordMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Generate JWT token
        const token = jwt.sign({ id: host.id, email: host.username }, 'your_secret_key', { expiresIn: '1h' });
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
const createKey = async (hostId:number): Promise<{ clientId: string; clientSecret: string, hostId:number }> => {
    try {
        const oauth2Client = new google.auth.OAuth2();

        // Generate a unique client ID and client secret
        const clientId = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/youtube',
                'https://www.googleapis.com/auth/youtube.upload'
            ]
        });
        const clientSecret = generateRandomString(10);

        // Save the generated keys to the database
        const savedKeys = await prisma.oAuth2Credential.create({
            data: {
                clientId,
                clientSecret,
                hostId,
            },
            
        });
        console.log(savedKeys);

        return savedKeys;
    } catch (error) {
        console.error('Error creating OAuth2 keys:', error);
        throw error;
    }
};


export {getAllHosts, registerHost, loginHost, createKey }