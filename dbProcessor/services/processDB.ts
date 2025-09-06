import { prisma } from "@exness/db";

export async function processDBOperation(operation: string, data: any) {
    try {
        switch(operation) {
            case 'CREATE_TRADE':
                const user = await prisma.user.upsert({
                    where: {
                        email: data.email,
                    },
                    update: {},
                    create: { email: data.email}
                });

                await prisma.existingTrade.create({
                    data: {
                        orderId: data.orderId,
                        openPrice: data.openPrice,
                        leverage: data.leverage,
                        liquidated: data.liquidated,
                        asset: { connect: {id: data.assetId }},
                        user: { connect: {id: user.id }}
                    }
                });

                console.log(`Trade created in DB: ${data.orderId}`);
                break;

            case 'UPDATE_TRADE':
                await prisma.existingTrade.update({
                    where: { orderId: data.orderId },
                    data: {
                        closePrice: data.closePrice,
                        pnl: data.pnl,
                        liquidated: data.liquidated
                    }
                });

                console.log(`Trade updated in DB: ${data.orderId}`);
                break;

            default:
                console.warn(`Unknown DB operation: ${operation}`);
        }
    } catch (error) {
        console.error(`Failed to process DB operation ${operation}:`, error);
        throw error;
    }
}