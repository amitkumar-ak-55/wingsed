// ===========================================
// Jest Setup - Runs before each test file
// ===========================================

// Extend Jest matchers if needed
// import '@testing-library/jest-dom';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.CLERK_SECRET_KEY = 'sk_test_mock_key';
process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_mock_key';
process.env.TYPESENSE_API_KEY = 'test_typesense_key';
process.env.TYPESENSE_HOST = 'localhost';
process.env.TYPESENSE_PORT = '8108';
process.env.TYPESENSE_PROTOCOL = 'http';

// Global test timeout
jest.setTimeout(10000);

// Silence console during tests (optional - comment out for debugging)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Clean up after all tests
afterAll(async () => {
  // Add any global cleanup here
});
