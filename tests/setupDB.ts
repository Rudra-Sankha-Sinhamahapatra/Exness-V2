import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

dotenv.config({ 
    path: path.resolve(__dirname, './.env.test'),
    override: true 
});

const SUPPORTED_ASSETS = [
    {
        symbol: "BTC",
        name: "Bitcoin",
        decimals: 4,
        imageUrl: "https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/1/bitcoin-bmg9hh1q4hk7jso7i2duzc.png/bitcoin-m01ryguriy9wrrdc8bby.png?_a=DATAg1AAZAA0"
    },
    {
        symbol: "ETH",
        name: "Ethereum",
        decimals: 6,
        imageUrl: "https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/3/ethereum-64rgvv272gw7b9ba1fy8h5.png/ethereum-4lzs35cggcozag28efbl7.png?_a=DATAg1AAZAA0"
    },
    {
        symbol: "SOL",
        name: "Solana",
        decimals: 6,
        imageUrl: "https://images.seeklogo.com/logo-png/42/1/solana-sol-logo-png_seeklogo-423095.png"
    }
];

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

        console.log("Seeding test assets...");
        const prisma = new PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL
                }
            }
        });

        try {
            console.log("Cleaning existing data...");
            
            await prisma.existingTrade.deleteMany({});
            console.log("Deleted existing trades");
            
            await prisma.user.deleteMany({});
            console.log("Deleted existing users");
            
            await prisma.asset.deleteMany({});
            console.log("Deleted existing assets");

            await prisma.asset.createMany({
                data: SUPPORTED_ASSETS.map(asset => ({
                    symbol: asset.symbol,
                    name: asset.name,
                    decimals: asset.decimals,
                    imageUrl: asset.imageUrl
                })),
                skipDuplicates: true
            });
            console.log(`Seeded ${SUPPORTED_ASSETS.length} assets successfully`);
        } finally {
            await prisma.$disconnect();
        }
        console.log('Test database setup complete!');
    } catch (error) {
        console.error('Failed to set up test database:', error);
        process.exit(1);
    }
}

setupTestDB();