/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // For DB-backed integration tests in src/tests/api
  setupFilesAfterEnv: ['./src/tests/setupTestDB.ts'],
  roots: ['<rootDir>/src/tests/api'],
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
};
