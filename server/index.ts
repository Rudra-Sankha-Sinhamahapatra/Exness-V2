import { router } from "./routes/routes";
import { PORT } from "./config";
import { prisma } from "@exness/db";
import { corsHeaders } from "./utils/corsOptions";

const server = {
    port: PORT,
    async fetch(req: Request) {
        if (req.method === "OPTIONS") {
            return new Response(null, {
                headers: corsHeaders
            });
        }

        const cookies = Object.fromEntries(
            (req.headers.get("cookie") || "")
                .split(";")
                .map(c => c.trim().split("=").map(decodeURIComponent))
        );

        (req as any).cookies = cookies;

        if (new URL(req.url).pathname === "/") {
            return new Response(JSON.stringify({ message: "hello" }), {
                headers: corsHeaders
            });
        }

        if (new URL(req.url).pathname.startsWith("/api/v1")) {
            const response = await router(req);

            const newHeaders = new Headers(response.headers);
            Object.entries(corsHeaders).forEach(([key, value]) => {
                newHeaders.set(key, value);
            });

            return new Response(response.body, {
                status: response.status,
                headers: newHeaders
            });
        }

        return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: corsHeaders
        });
    }
};

console.log(`Server is running on http://localhost:${PORT}`);

Bun.serve(server);

process.on('SIGINT', async () => {
    console.log('Shutting down Server...');
    try {
        await Promise.all([
            prisma.$disconnect()
        ]);
        console.log('Server closed');
        process.exit(0);
    } catch (error) {
        console.error('Server error:', error);
        process.exit(1);
    }
});