/**
 * @type {import('jest').Config}
 */
const config = {
  projects: [
    // API/backend tests in Node.js environment
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['**/__tests__/api/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/__tests__/setup-node.js'],
    },
    // Frontend/component tests in JSDOM environment
    {
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      testMatch: [
        '**/__tests__/components/**/*.test.js',
        '**/__tests__/pages/**/*.test.js',
        '**/__tests__/hooks/**/*.test.js',
        '**/__tests__/contexts/**/*.test.js',
      ],
      setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
      transform: {
        '^.+\\.(js|jsx)$': [
          'babel-jest',
          {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        ],
      },
    },
  ],
  collectCoverageFrom: [
    'contexts/**/*.js',
    'components/**/*.js',
    'pages/**/*.js',
    'hooks/**/*.js',
    'server/**/*.js', // Include server-side code
    '!**/*.test.js',
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 13,
      functions: 16,
      lines: 15,
      statements: 15,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
};

module.exports = config;