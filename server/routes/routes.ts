import { signup, signin, authPost } from "../controllers/auth";
import { authMiddleware } from "../authMiddleware";
import { getUsdcBalance, getUserBalance } from "../controllers/balance";
import { supportedAssets, upsertAssets } from "../controllers/assets";
import { closeTrade, createTrade, getTradeHistory } from "../controllers/trade";
import { getKlines } from "../controllers/klines";
import { jsonResponse } from "../utils/jsonResponse";

export async function router(req: Request): Promise<Response> {
    try {
        const url = new URL(req.url);
        const path = url.pathname.replace("/api/v1", "");

        if (req.method === "POST") {
            try {
                const validation = req.clone();
                await validation.json(); 

                switch (path) {
                    case "/signup":
                        return await signup(req);
                    case "/signin":
                        return await signin(req);
                    case "/trade/create":
                        return await authMiddleware(req, async (req) => createTrade(req));
                    case "/trade/close":
                        return await authMiddleware(req, async (req) => closeTrade(req));
                    default:
                         return jsonResponse({ error: "Invalid JSON payload" }, 400);
                }
            } catch (error) {
                 return jsonResponse({ error: "Invalid JSON payload" }, 400);
            }
        }

        if (req.method === "GET") {
            switch (path) {
                case "/signin/post":
                    return await authPost(req);
                case "/balance":
                    return await authMiddleware(req, getUserBalance);
                case "/balance/usd":
                    return await authMiddleware(req, getUsdcBalance);
                case "/supportedAssets":
                    return await supportedAssets(req);
                case "/klines":
                    return await getKlines(req);
                case "/trade/history":
                    return await authMiddleware(req, async (req) => getTradeHistory(req));
                default:
                    return jsonResponse({ error: "Not found" }, 404);
            }
        }

         return jsonResponse({ error: "Method not allowed" }, 405);
    } catch (error) {
        console.error('Router error:', error);
       return jsonResponse({ error: "Internal server error" }, 500);
    }
}