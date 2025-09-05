import request from "supertest"
import { createTestApp } from "../testApp"
import { waitForResponse } from "../../server/utils/waitForResponse"

const app = createTestApp();

describe('POST /api/v1/trade/create', () => {
    it("200 with orderId on engine success", async () => {
        (waitForResponse as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: { orderId: "order-123"},
        });

        const res = await request(app)
        .post("/api/v1/trade/create")
        .send({ asset: "BTC", type: "long", margin: 1000, leverage: 5, slippage: 1});

        expect(res.status).toBe(200);
        expect(res.body.orderId).toBeDefined();
    });

    it("500 on engine error", async () => {
        (waitForResponse as jest.Mock).mockResolvedValueOnce({
            success: false,
            error: "Trade failed"
        });

        const res = await request(app)
        .post("/api/v1/trade/create")
        .send({ asset: "ETH", type:"short", margin: 100, leverage: 2, slippage: 1 });

        expect(res.status).toBe(500);
    });
});