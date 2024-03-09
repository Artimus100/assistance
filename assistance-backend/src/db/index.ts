import { Pool } from 'pg';

// Create a new Pool instance
const pool = new Pool({
    user: 'artimus100',
    host: 'localhost',
    database: 'assistance',
    password: 'rahul6186',
    port: 3000 // Default PostgreSQL port
});

export default pool;