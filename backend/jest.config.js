/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.js',
    '<rootDir>/src/**/*.{test,spec}.js',
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/app.js',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  // Auto-clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  // Timeout for async operations
  testTimeout: 10000,
  // Environment setup
  setupFilesAfterFramework: ['<rootDir>/src/__tests__/setup.js'],
};
