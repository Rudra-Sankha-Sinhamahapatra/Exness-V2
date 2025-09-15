import { generateLinkToken, generateSessionToken, verifyToken } from "../token";
import { resendClient } from "../resend";
import { BACKEND_URL, FRONTEND_URL } from "../config";
import { REDIS_PUSH_QUEUE } from "../redis";
import { prisma } from "@exness/db";
import { jsonResponse } from "../utils/jsonResponse";

async function SendAuthEmail(email: string, type: "signup" | "signin", token: string) {
    const link = `${BACKEND_URL}/api/v1/signin/post?token=${token}`;
    console.log(email)
    console.log(link)
    const res = await resendClient.emails.send({
        from: 'tradingpro@mail.rudrasankha.com',
        to: email,
        subject: type === "signup" ? "Signup Confirmation" : "Signin Link",
        html: `<p>Your ${type} link is: <a href="${link}">${link}</a></p>`,
    });
    console.log(res)
}

export const signup = async (req: Request): Promise<Response> => {
    try {
        const { email } = await req.json() as { email?: string };
        if (!email) return jsonResponse({ error: "Email required" }, 400);


        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (existingUser) {
            return jsonResponse({
                success: false,
                message: "User already exists"
            }, 409);
        }

        const token = generateLinkToken(email);
        await SendAuthEmail(email, "signup", token);

        return jsonResponse({
            message: "Kindly check your mail for the signup link"
        });
    } catch (error: any) {
        return jsonResponse({
            message: "Internal Server error",
            error: String(error)
        }, 500);
    }
}

export const signin = async (req: Request): Promise<Response> => {
    try {
        console.log("signin hii")
        const { email } = await req.json() as { email?: string };
        if (!email) return jsonResponse({ error: "Email required" }, 400);

        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!existingUser) {
            return jsonResponse({
                success: false,
                message: "User not found"
            }, 404);
        }

        const token = generateLinkToken(email);
        await SendAuthEmail(email, "signin", token)

        return jsonResponse({
            message: "Kindly check your mail for the signin link"
        });
    } catch (error: any) {
        return jsonResponse({
            message: "Internal Server error",
            error: error.message
        }, 500);
    }
}

export const authPost = async (req: Request): Promise<Response> => {
    try {
        const url = new URL(req.url);
        const token = url.searchParams.get('token');

        if (!token || typeof token !== "string") {
            return jsonResponse({ error: "Invalid token" }, 400);
        }

        const email = verifyToken(token);
        if (!email) return jsonResponse({ error: "Invalid/expired token" }, 400);

        const walletChannel = "user_wallet_stream";
        const event = "INITIALIZE_WALLET"

        await REDIS_PUSH_QUEUE.lpush(walletChannel, JSON.stringify({ email, event }))

        const sessionToken = generateSessionToken(email);

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (!existingUser) {
            await prisma.user.create({
                data: {
                    email,
                    lastLoggedIn: new Date()
                }
            })
        }

        const isProd = process.env.NODE_ENV === "production";

        const cookieOptions = [
            "Path=/",
            "HttpOnly",
            isProd ? "SameSite=None" : "SameSite=Lax",
            isProd ? "Secure" : "",
            isProd ? "Domain=.rudrasankha.com" : "",
            "Max-Age=604800",
        ]
            .filter(Boolean)
            .join("; ");



        return new Response(null, {
            status: 302,
            headers: {
                Location: `${FRONTEND_URL}/dashboard`,
                "Set-Cookie": `authToken=${sessionToken}; ${cookieOptions}`,
            },
        });
    } catch (error) {
        console.log('error: ', error);
        return jsonResponse({
            message: "Internal Server Error"
        }, 500);
    }
}

export const logout = async (_req: Request): Promise<Response> => {
    try {

        const isProd = process.env.NODE_ENV === "production";

        const cookieOptions = [
            "Path=/",
            "HttpOnly",
            isProd ? "SameSite=None" : "SameSite=Lax",
            isProd ? "Secure" : "",
            isProd ? "Domain=.rudrasankha.com" : "",
            "Expires=Thu, 01 Jan 1970 00:00:00 GMT"
        ]
            .filter(Boolean)
            .join("; ");

        return new Response(
            JSON.stringify({ message: "Logged out" }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Set-Cookie": `authToken=; ${cookieOptions}`
                }
            }
        );
    } catch (error) {
        return jsonResponse(
            { message: "Internal Server Error", error: String(error) },
            500
        );
    }
};
