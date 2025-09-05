import "jest"
import Redis from "ioredis-mock"

// we don't actually send mails
jest.mock("../server/resend", () => ({
    resendClient: {
        emails: { send: jest.fn().mockResolvedValue({ id: "fake-email-id" })},
    },
}));

// mocking server's redis clients 
jest.mock("../server/redis", () => {
    const mockClient = new(Redis as any)();
    return {
    REDIS_PUSH_QUEUE: mockClient,
    REDIS_RECEIVE_QUEUE: mockClient,
    REDIS_URL: "redis://localhost:6379"
    }
})

// By default, pretending engine responds immeadiately
jest.mock("../server/utils/waitForResponse", () => ({
    waitForResponse: jest.fn(async () => ({
        success: true,
        data: { orderId: "test-order-id" }
    }))
}))

jest.mock("../server/authMiddleware", () => {
    return {
        authMiddleware: (req:any, _res:any, next:any) => {
            if(!req.user) req.user = { email: "test@gmail.com"};
            next()
        }
    }
})

jest.mock("../engine/store/assetPrice", () => ({
    latestAssetPrices: {
        BTC: { price: BigInt(1000000000), decimals: 4 },
        ETH: { price: BigInt(1000000000), decimals: 6 },
        SOL: { price: BigInt(1000000000), decimals: 6 },
    }
}));