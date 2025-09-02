import type { Request, Response } from "express";
import { generateLinkToken, generateSessionToken, verifyToken } from "../store";
import { resendClient } from "../resend";
import { BACKEND_URL, FRONTEND_URL } from "../config";

async function SendAuthEmail(email: string, type: "signup" | "signin", token: string) {
    const link = `${BACKEND_URL}/api/v1/signin/post?token=${token}`;
    await resendClient.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: type === "signup" ? "Signup Confirmation" : "Signin Link",
        html: `<p>Your ${type} link is: <a href="${link}">${link}</a></p>`,
    });
}

export const signup = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email required" });

        const token = generateLinkToken(email);
        await SendAuthEmail(email, "signup", token);

        res.status(200).json({
            message: "Kindly check your mail for the signup link"
        })
        return
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error"
        })
        return;
    }
}

export const signin = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email required" });

        const token = generateLinkToken(email);
        await SendAuthEmail(email, "signin", token);

        res.status(200).json({
            message: "Kindly check your mail for the signin link"
        })
        return;
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error"
        })
        return;
    }
}

export const authPost = async (req: Request, res: Response) => {
    try {
        const { token } = req.query;

        if (!token || typeof token !== "string") {
            return res.status(400).json({ error: "Invalid token" });
        }

        const email = verifyToken(token);
        if (!email) return res.status(400).json({ error: "Invalid/expired token" });

        const sessionToken = generateSessionToken(email);
        res.cookie("authToken", sessionToken, {
            httpOnly: true,
            secure: false, 
            sameSite: "lax",
        });

        res.redirect(`${FRONTEND_URL}/dashboard`);
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
        return
    }
}
