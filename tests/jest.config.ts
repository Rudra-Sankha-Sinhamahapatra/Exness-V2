import type { Config } from "jest"

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    rootDir: "..",
    testMatch: ["<rootDir>/tests/**/*.(test|spec).ts"],
    setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
    moduleNameMapper: {
        "^@exness/db$": "<rootDir>/tests/_mocks_/prisma.ts",
        "^uuid$": require.resolve('uuid'),
    },
    moduleDirectories: ["node_modules", "<rootDir>"],
    testTimeout: 30000,
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: "<rootDir>/tsconfig.json",
                useESM: false
            },
        ],
    },
    transformIgnorePatterns: [
        "/node_modules/(?!uuid).+\\.js$"
    ],
}

export default config;