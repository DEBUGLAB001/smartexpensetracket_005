module.exports = {
  testEnvironment: 'node',
  reporters: [
    './json-reporter.js'
  ],
  verbose: false,
  silent: true,
  testMatch: ['**/tests/**/*.test.js']
};
