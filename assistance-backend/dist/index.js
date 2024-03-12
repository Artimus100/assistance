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
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
// import session from 'express-session';
// import {hostRouter} from './routes/host';
// import editorRouter from './routes/editor';
const editor_1 = require("./routes/editor");
const editor_2 = require("./routes/editor");
const editor_3 = require("./routes/editor"); // Import your route handler function
//imports from the host route
const host_1 = require("./routes/host");
const host_2 = require("./routes/host");
const host_3 = require("./routes/host");
const host_4 = require("./routes/host");
//  import { oAuth2Credentials } from './routes/host'
const app = express();
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
//  app.post('/getKeys', oAuth2Credentials)
// Route for logging in a host
app.post('/login', host_3.loginHost);
// // Start the server
app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});
