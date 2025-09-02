import { REDIS_PUBLISHER } from "../redis";
import { getUserBalance, initializeBalance } from "../store/balance";

type EventData = {
    email: string;
    event?: string;
    responseChannel?: string;
}

function serializeBigInt(data: any): string {
    return JSON.stringify(data, (_key, value) => 
        typeof value === 'bigint' ? Number(value) : value
    );
}

export async function Processor(event: string | undefined, data: EventData) {
    let result;
    
    try {
        console.log("Processing event:", event, "for email:", data.email);
        
        switch(event) {
            case "GET_USER_BALANCE":
                result = getUserBalance(data.email);
                console.log("Getting balance for:", data.email);
                break;
            
            case "GET_USDC_BALANCE":
                const balance = getUserBalance(data.email);
                if (!balance) {
                    throw new Error("Balance not found");
                }
                result = {
                    email: data.email,
                    usdc: balance.usdc
                };
                console.log("Getting USDC balance for:", data.email, result);
                break;
            
            case "INITIALIZE_WALLET":
                result = initializeBalance(data.email);
                console.log("Initializing wallet for:", data.email);
                break;
                
            default: 
                console.log("Unknown event:", event);
                throw new Error(`Unknown event: ${event}`);
        }

        if (data.responseChannel && result) {
            await REDIS_PUBLISHER.publish(data.responseChannel, serializeBigInt({
                success: true,
                data: result
            }));
        }

        return result;
    } catch (error) {
        console.error("Processor error:", error);
        if (data.responseChannel) {
            await REDIS_PUBLISHER.publish(data.responseChannel, JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Internal processing error"
            }));
        }
        return null;
    }
}