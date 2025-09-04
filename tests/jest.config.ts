import type { Config } from "jest"

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    rootDir: "..",
    testMatch: ["<rootDir>/tests/**/*.(test|spec).ts"],
    setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
    moduleNameMapper: {
        "^@exness/db$": "<rootDir>/tests/_mocks_/prisma.ts",
    },
    moduleDirectories: ["node_modules", "<rootDir>"],
    testTimeout: 30000,
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: "<rootDir>/tsconfig.json",
                isolatedModules: true,
            },
        ],
    }
}

export default config;