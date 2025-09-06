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

     const mockPrices: { [key: string]: string } = {
        'price-BTC': JSON.stringify({ price: "50000000000", decimal: 4 }),
        'price-ETH': JSON.stringify({ price: "3000000000", decimal: 6 }),
        'price-SOL': JSON.stringify({ price: "200000000", decimal: 6 })
    };

    mockClient.get = jest.fn().mockImplementation((key:string) => {
        return Promise.resolve(mockPrices[key] || null)
    })
    
    return {
    redis: mockClient,
    REDIS_PUSH_QUEUE: mockClient,
    REDIS_RECEIVE_QUEUE: mockClient,
    REDIS_URL: "redis://localhost:6381"
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