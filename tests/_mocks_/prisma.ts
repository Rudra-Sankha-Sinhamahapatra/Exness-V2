
//prisma mock
export const prisma = {
    user: {
        findUnique: jest.fn(async ({ where: { email }}: any) => null),
        create: jest.fn(async ({data}: any) => ({ id:"user1", ...data})),
    }
}