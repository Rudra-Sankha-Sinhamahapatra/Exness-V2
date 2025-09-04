import { Pool } from 'pg';
import { SNAPSHOT_URL } from '../config';

export const pool = new Pool({
    connectionString: SNAPSHOT_URL
});

export async function initDB() {
    const client = await pool.connect();
    try {
        await client.query(`
        CREATE TABLE IF NOT EXISTS snapshots (
        id TEXT PRIMARY KEY,
        open_orders JSONB NOT NULL,
        closed_orders JSONB NOT NULL,
        balances JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Database initialized successfully");
    } catch (error) {
        console.error('Failed to initialize DB:', error);
        throw error; 
    } finally {
        client.release();
    }
}