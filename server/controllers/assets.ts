import type { Request, Response } from "express";
import { SUPPORTED_ASSETS } from "../utils/supportedAssets";

export const supportedAssets = async (req: Request, res: Response) => {
    try {
       const assets = SUPPORTED_ASSETS;
       res.status(200).json({
        "assets":assets
       })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server error"
        });
        return;
    }
}