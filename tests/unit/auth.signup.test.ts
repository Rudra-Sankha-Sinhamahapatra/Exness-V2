import request from "supertest"
import { createTestApp } from "../testApp"
import { prisma } from "@exness/db"

const app = createTestApp();

describe("POST /api/v1/signup", () => {
 it("400 when email missing", async () => {
    const res = await request(app).post('/api/v1/signup').send({});
    expect(res.status).toBe(400);
 });

 it("409 when user exists", async () => {
   (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id:"x",email:"a@b.com" });
   const res = await request(app).post("/api/v1/signup").send({ email:"a@b.com" });
   expect(res.status).toBe(409);
 });

it("200 on new user", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const res = await request(app).post("/api/v1/signup").send({ email: "new@user.com" });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/signup link/i);
})

});