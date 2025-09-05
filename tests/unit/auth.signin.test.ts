import request from "supertest"
import { createTestApp } from "../testApp"
import { prisma } from "@exness/db"

const app = createTestApp();

describe("POST /api/v1/signin", () => {
 it("400 when email missing", async () => {
       const res = await request(app).post('/api/v1/signin').send({});
       expect(res.status).toBe(400)
 });

 it("POST 404 when user not found", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const res = await request(app).post('/api/v1/signin').send({ email: "new@b.com" });
    expect(res.status).toBe(404);
 });

 it("200 on new user", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id:"u1", email:"a@b.com"});
    const res = await request(app).post("/api/v1/signin").send({ email: "a@b.com" });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/signin link/i);
 })
});