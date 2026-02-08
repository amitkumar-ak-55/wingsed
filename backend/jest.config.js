/** @type {import('jest').Config} */
module.exports = {
  // Use ts-jest for TypeScript
  preset: 'ts-jest',
  
  // Test environment
  testEnvironment: 'node',
  
  // Root directory
  rootDir: '.',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/src/**/*.test.ts',
  ],
  
  // Module path aliases (matching tsconfig)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
    '!src/**/index.ts',
    '!src/scripts/**', // Scripts are run manually, not tested
  ],
  
  // Coverage thresholds - enforce quality
  // Core business logic (services/controllers) has 100% coverage
  // Lower threshold accounts for webhooks/typesense which require external services
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  
  // Coverage output directory
  coverageDirectory: './coverage',
  
  // Transform TypeScript files
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
  
  // Module directories
  moduleDirectories: ['node_modules', 'src'],
  
  // File extensions
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Timeout for tests (10 seconds)
  testTimeout: 10000,
};
