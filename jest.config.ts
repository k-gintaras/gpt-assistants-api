/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  // For local/basic integration tests (no DB)
  roots: ['<rootDir>/src/tests/unit'],

  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
};
