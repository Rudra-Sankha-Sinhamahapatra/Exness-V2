import type { Request, Response } from "express";
import { SUPPORTED_ASSETS } from "../utils/supportedAssets";
import { prisma } from "@exness/db";

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

export const upsertAssets = async (req: Request,res: Response) => {
    try {
        console.log("Upserting assets into DB");

        const upsertAssets = await Promise.all(
            SUPPORTED_ASSETS.map(async (asset) => {
                const result = await prisma.asset.upsert({
                    where: { symbol: asset.symbol },
                    update: {
                        name: asset.name,
                        decimals: asset.decimals,
                        imageUrl: asset.imageUrl
                    },
                    create: {
                        symbol: asset.symbol,
                        name: asset.name,
                        decimals: asset.decimals,
                        imageUrl: asset.imageUrl
                    }
                })
                console.log(`Upserted ${asset.symbol}: ${asset.name}`);
                return {
                 symbol: result.symbol,
                 name: result.name,
                 decimals: result.decimals,
                 imageUrl: result.imageUrl
                };
            })
        );

        const totalAssets = await prisma.asset.count();

        console.log(`Asset upsert completed. Total assets in DB: ${totalAssets}`);

        res.status(200).json({
            success: true,
            message: `Successfully upserted ${upsertAssets.length} assets`,
            data: {
                upserted: upsertAssets,
                totalAssets
            }
        })
        return;
    } catch (error) {
        console.error("Failed to upsert data into DB: ",error);
        res.status(500).json({
            success: false,
            message: "Failed to delete asset"
        })
        return;
    }
}