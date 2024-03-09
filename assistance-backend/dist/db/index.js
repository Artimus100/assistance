"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
// Create a new Pool instance
const pool = new pg_1.Pool({
    user: 'artimus100',
    host: 'localhost',
    database: 'assistance',
    password: 'rahul6186',
    port: 3000 // Default PostgreSQL port
});
exports.default = pool;
