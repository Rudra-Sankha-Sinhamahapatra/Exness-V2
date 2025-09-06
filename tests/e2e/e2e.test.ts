import request from "supertest"
import { ChildProcess, spawn } from "child_process"
import { startWsMockserver } from "./mockWs"
import dotenv from 'dotenv';
import path from 'path';
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"

const COOKIE_EXPIRY = '7d';


dotenv.config({
    path: path.resolve(__dirname, '../.env.test'),
    override: true
});

const JWT_SECRET = process.env.JWT_SECRET || "tsyhsvh";
const generateSessionToken = (email: string) => {
    return jwt.sign({ email }, JWT_SECRET, { expiresIn: COOKIE_EXPIRY })
}

function wait(ms: number) { return new Promise(r => setTimeout(r, ms)); }

describe("E2E: poller + engine + api", () => {
    let wss: any;
    let poller: ChildProcess | null = null;
    let engine: ChildProcess | null = null;
    let api: ChildProcess | null = null;
    let startDBProcessor: ChildProcess | null = null;
    let agent: request.Agent;
    let prisma: PrismaClient;

    beforeAll(async () => {
        prisma = new PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL
                }
            }
        });

        wss = startWsMockserver(8089);

        const testEnv = {
            ...process.env,
            WS_URL: "ws://localhost:8089",
            NODE_ENV: "test"
        };

        console.log("Testenv :", testEnv)

        poller = spawn("bun", ["run", "poller/index.ts"], {
            env: testEnv,
            stdio: "inherit",
        });

        await wait(2000);

        startDBProcessor = spawn("bun", ["run", "dbProcessor/index.ts"], {
        env: testEnv,
        stdio: "inherit",
        });

        await wait(2000);

        engine = spawn("bun", ["run", "engine/index.ts"], {
            env: testEnv,
            stdio: 'inherit',
        });
        await wait(2000);


        api = spawn('bun', ["run", "server/index.ts"], {
            env: testEnv,
            stdio: "inherit",
        });

        await wait(2000)

        agent = request.agent("http://localhost:8000");
    }, 60000);

    afterAll(async () => {
        wss?.close?.();
        poller?.kill?.('SIGTERM');
        engine?.kill?.('SIGTERM');
        api?.kill?.('SIGTERM');
        startDBProcessor?.kill('SIGTERM');
        
        await prisma?.$disconnect();
        ;
        await wait(1000);
    }, 60000);

    afterAll(async () => {
        wss?.close?.();
        poller?.kill?.('SIGTERM');
        engine?.kill?.('SIGTERM');
        api?.kill?.('SIGTERM');

        await wait(1000);
    }, 10000);

    it("can open and close a trade end-to-end", async () => {
        const email = "e2e@gmail.com";

        await prisma.user.upsert({
            where: { email },
            update: {},
            create: { email }
        });

        const sessionToken = generateSessionToken(email);

        let res = await agent
            .post("/api/v1/trade/create")
            .set("Cookie", `authToken=${sessionToken}`)
            .send({
                asset: "BTC",
                type: "long",
                margin: 1000,
                leverage: 2,
                slippage: 2
            });

        console.log('Create trade response:', res.body);
        expect(res.status).toBe(200);
        expect(res.body.orderId).toBeDefined();

        const orderId = res.body.orderId;

        await wait(2000);

        res = await agent
            .post("/api/v1/trade/close")
            .set("Cookie", `authToken=${sessionToken}`)
            .send({ orderId });

        console.log('Close trade response:', res.body);
        expect(res.status).toBe(200);
    }, 30000);
})