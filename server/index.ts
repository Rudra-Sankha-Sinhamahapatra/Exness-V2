import { router } from "./routes/routes";
import { PORT } from "./config";
import { prisma } from "@exness/db";
import { corsHeaders } from "./utils/corsOptions";
import { rateLimiter } from "./utils/rateLimiter"

const server = {
    port: PORT,
    async fetch(req: Request) {

        const ip =
            req.headers.get("x-forwarded-for") ||
            req.headers.get("cf-connecting-ip") ||
            "unknown";

        try {
            const rlRes = await rateLimiter.consume(ip);

            console.log(`[RateLimiter] IP=${ip} -> Remaining=${rlRes.remainingPoints}/${rateLimiter.points}, Reset in=${Math.ceil(rlRes.msBeforeNext / 1000)}s`);

            const headers = {
                ...corsHeaders,
                "X-RateLimit-Limit": "5",
                "X-RateLimit-Remaining": rlRes.remainingPoints.toString(),
                "X-RateLimit-Reset": (Date.now() + rlRes.msBeforeNext).toString(),
            };

            if (req.method === "OPTIONS") {
                return new Response(null, {
                    headers
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
                    headers
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
                headers
            });
        } catch (rejRes: any) {
            return new Response(
                JSON.stringify({
                    error: "Too many requests",
                    retryAfter: Math.ceil(rejRes.msBeforeNext / 1000),
                    limit: rateLimiter.points,
                }),
                {
                    status: 429,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                        "Retry-After": String(Math.ceil(rejRes.msBeforeNext / 1000)),
                    },
                }
            );
        }
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