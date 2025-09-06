import request from "supertest"
import { createTestApp } from "../testApp"
import { waitForResponse } from "../../server/utils/waitForResponse"

const app = createTestApp();

describe('POST /api/v1/trade/create', () => {
    it("200 with orderId on engine success", async () => {
        (waitForResponse as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: { orderId: "order-123" },
        });

        const res = await request(app)
            .post("/api/v1/trade/create")
            .send({ asset: "BTC", type: "long", margin: 1000, leverage: 5, slippage: 20 });

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
            .send({ asset: "ETH", type: "short", margin: 100, leverage: 2, slippage: 17 });

        expect(res.status).toBe(500);
        expect(res.body.error).toBe("Trade failed");
    });

    describe("Margin Valiation", () => {
        const message = "Margin must be greater than 0.99";

        it("400 when margin is less than 1", async () => {
            const res = await request(app)
                .post('/api/v1/trade/create')
                .send({ asset: "BTC", type: "long", margin: 99, leverage: 5, slippage: 16 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe(message);
        });

        it("400 when margin is negative", async () => {
            const res = await request(app)
                .post("/api/v1/trade/create")
                .send({ asset: "BTC", type: "long", margin: -1, leverage: 10, slippage: 19 });

            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.message).toBe(message)
        });

        it("200 when margin is 1 or greater than 1", async () => {
            (waitForResponse as jest.Mock).mockResolvedValueOnce({
                success: true,
                data: { orderId: "order-123" },
            });

            const res = await request(app)
                .post("/api/v1/trade/create")
                .send({ asset: "SOL", type: "long", margin: 100, leverage: 5, slippage: 20 });

            expect(res.status).toBe(200);
            expect(res.body.orderId).toBeDefined();

        })
    });

    describe("Asset Validation", () => {
        const message = "Invalid asset. Supported assets are SOL, ETH, BTC";

        it("400 when asset is invalid", async () => {
            const res = await request(app)
                .post("/api/v1/trade/create")
                .send({ asset: "DOGE", type: "long", margin: 100, leverage: 5, slippage: 34 });

            expect(res.status).toBe(400)
            expect(res.body.message).toBe(message)
            expect(res.body.success).toBe(false)
        });

        it("400 when asset is lowercase", async () => {
            const res = await request(app)
                .post("/api/v1/trade/create")
                .send({ asset: "btc", type: "long", margin: 100, leverage: 5, slippage: 43 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe(message);
        });

        it("400 when asset is empty", async () => {
            const res = await request(app)
                .post("/api/v1/trade/create")
                .send({ asset: "", type: "long", margin: 100, leverage: 5, slippage: 18 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe(message);
        });

        it("200 when valid asset SOL", async () => {
            (waitForResponse as jest.Mock).mockResolvedValueOnce({
                success: true,
                data: { orderId: "order-123" },
            });

            const res = await request(app)
                .post("/api/v1/trade/create")
                .send({ asset: "SOL", type: "long", margin: 100, leverage: 5, slippage: 24 });

            expect(res.status).toBe(200);
            expect(res.body.orderId).toBeDefined();
        });
    });

     describe('Trade Type Validation', () => {
        it("400 when trade type is invalid", async () => {
            const res = await request(app)
                .post("/api/v1/trade/create")
                .send({ asset: "BTC", type: "buy", margin: 100, leverage: 5, slippage: 12 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Invalid trade type. Supported types are long and short");
        });

        it("400 when trade type is empty", async () => {
            const res = await request(app)
                .post("/api/v1/trade/create")
                .send({ asset: "BTC", type: "", margin: 100, leverage: 5, slippage: 12 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Invalid trade type. Supported types are long and short");
        });

        it("400 when trade type is uppercase", async () => {
            const res = await request(app)
                .post("/api/v1/trade/create")
                .send({ asset: "BTC", type: "LONG", margin: 100, leverage: 5, slippage: 12 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Invalid trade type. Supported types are long and short");
        });

              it("200 with valid short type", async () => {
            (waitForResponse as jest.Mock).mockResolvedValueOnce({
                success: true,
                data: { orderId: "order-123"},
            });

            const res = await request(app)
                .post("/api/v1/trade/create")
                .send({ asset: "BTC", type: "short", margin: 100, leverage: 5, slippage: 12 });

            expect(res.status).toBe(200);
        });

    });

    describe('Slippage validation', () => {
        const message = "Slippage value should be between 0.1 to 100 %";

        it("400 when Slippage is less than 0.1%", async () => {
                     const res = await request(app)
                .post("/api/v1/trade/create")
                .send({ asset: "BTC", type: "long", margin: 100, leverage: 6, slippage: 9});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe(message);
        })

           it("400 when Slippage is greater than 100%", async () => {
                     const res = await request(app)
                .post("/api/v1/trade/create")
                .send({ asset: "BTC", type: "long", margin: 100, leverage: 6, slippage: 10001});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe(message);
        })

    })

      describe('Leverage Validation', () => {
        it("400 when leverage is less than 1", async () => {
            const res = await request(app)
                .post("/api/v1/trade/create")
                .send({ asset: "BTC", type: "long", margin: 100, leverage: 0, slippage: 12 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Leverage must be between 1 and 100");
        });

        it("400 when leverage is greater than 100", async () => {
            const res = await request(app)
                .post("/api/v1/trade/create")
                .send({ asset: "BTC", type: "long", margin: 100, leverage: 101, slippage: 18 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Leverage must be between 1 and 100");
        });

         it("200 with leverage 1 (minimum valid)", async () => {
            (waitForResponse as jest.Mock).mockResolvedValueOnce({
                success: true,
                data: { orderId: "order-123"},
            });

            const res = await request(app)
                .post("/api/v1/trade/create")
                .send({ asset: "BTC", type: "long", margin: 100, leverage: 1, slippage: 18 });

            expect(res.status).toBe(200);
        });

        it("200 with leverage 100 (maximum valid)", async () => {
            (waitForResponse as jest.Mock).mockResolvedValueOnce({
                success: true,
                data: { orderId: "order-123"},
            });

            const res = await request(app)
                .post("/api/v1/trade/create")
                .send({ asset: "BTC", type: "long", margin: 100, leverage: 100, slippage: 26 });

            expect(res.status).toBe(200);
        });

        it("200 when leverage is in middle (50)", async () => {
            (waitForResponse as jest.Mock).mockReturnValueOnce({
                success: true,
                data: { orderId: "order-123" }
            });

            const res = await request(app)
            .post("/api/v1/trade/create")
            .send({ asset: "BTC", type: "long", margin: 100, leverage: 50, slippage: 28 });

            expect(res.status).toBe(200)
            expect(res.body.orderId).toBeDefined()
        })
    });

});