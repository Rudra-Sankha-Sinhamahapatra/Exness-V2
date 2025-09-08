import { SUPPORTED_ASSETS } from "../utils/supportedAssets";
import { prisma } from "@exness/db";
import { jsonResponse } from "../utils/jsonResponse";

export const supportedAssets = async (req: Request): Promise<Response> => {
    try {
       return jsonResponse({ assets: SUPPORTED_ASSETS });
    } catch (error) {
        return jsonResponse({
            success: false,
            message: "Internal Server error"
        }, 500);
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

      
        return jsonResponse({
            success: true,
            message: `Successfully upserted ${upsertAssets.length} assets`,
            data: {
                upserted: upsertAssets,
                totalAssets
            }
        });
    } catch (error) {
        console.error("Failed to upsert data into DB: ",error);
        return jsonResponse({
            success: false,
            message: "Failed to delete asset"
        }, 500);
    }
}