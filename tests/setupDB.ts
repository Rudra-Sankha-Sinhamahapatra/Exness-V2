import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process';

dotenv.config({ 
    path: path.resolve(__dirname, './.env.test'),
    override: true 
});

async function setupTestDB() {
    console.log('Setting up test database...');
    
    try {
        execSync('npx prisma db push --skip-generate', {
            env: {
                ...process.env,
                DATABASE_URL: process.env.DATABASE_URL,
            },
            stdio: 'inherit',
            cwd: path.resolve(__dirname, '../packages/db')
        });

        console.log('Test database setup complete!');
    } catch (error) {
        console.error('Failed to set up test database:', error);
        process.exit(1);
    }
}

setupTestDB();