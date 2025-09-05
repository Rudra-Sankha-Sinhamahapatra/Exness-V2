import request from "supertest"
import { waitForResponse } from "../../server/utils/waitForResponse"
import { createTestApp } from "../testApp"
import { error } from "console";

const app = createTestApp();

describe("POST /api/v1/trade/close", () => {
    it("404 when order Id is missing", async () => {
       const res = await request(app).post('/api/v1/trade/close').send({});
       expect(res.status).toBe(400);
    });

    it("200 when order closes successfully", async () => {
        (waitForResponse as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: { orderId: "order-546"},
        });

        const res = await request(app)
        .post('/api/v1/trade/close')
        .send({ orderId: "order-546"});

        expect(res.status).toBe(200);
        expect(res.body.orderId).toBeDefined();
    })

    it("500 on engine trade close failure or error", async () => {
        (waitForResponse as jest.Mock).mockResolvedValueOnce({
            success: false,
            error: "Failed to close trade"
        });

        const res = await request(app)
        .post("/api/v1/trade/close")
        .send({ orderId: "invalid-order-id" })

        expect(res.status).toBe(500);
        expect(res.body.error).toBeDefined();
    })
})