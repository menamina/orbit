export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/cycleTracking.test.js',
    '/tests/notes.test.js',
    '/tests/unit.test.js',
  ],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
  ],
};
