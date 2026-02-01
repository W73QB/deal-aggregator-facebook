module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'next/core-web-vitals'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  globals: {
    // Cypress globals
    cy: 'readonly',
    Cypress: 'readonly',
    // Test globals
    describe: 'readonly',
    it: 'readonly',
    before: 'readonly',
    after: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    expect: 'readonly',
    context: 'readonly'
  },
  rules: {
    'no-unused-vars': 'off',
    'no-console': 'off',
    'prefer-const': 'error',
    'react/no-unescaped-entities': 'off',
    '@next/next/no-page-custom-font': 'off',
    '@next/next/no-html-link-for-pages': 'error',
    '@next/next/no-img-element': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'import/no-anonymous-default-export': 'off',
    'jsx-a11y/alt-text': 'error',
    'no-case-declarations': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  ignorePatterns: [
    'coverage/**',
    'scripts/**',
    'docs/**',
    'external-api/**',
    'monitoring/**',
    'backups/**',
    'cypress/**',
    'tests/**',
    'assets/**',
    'automation/**',
    '__tests__/**'
  ],
  overrides: [
    {
      // Ignore lint errors in legacy/automation scripts
      files: ['automation/**/*.js', 'tools/**/*.js', 'backups/**/*.js', 'assets/products/**/*.js'],
      rules: {
        'no-useless-escape': 'off',
        'no-unused-vars': 'off',
        'no-inner-declarations': 'off'
      }
    },
    {
      // Core application files - stricter rules
      files: ['pages/**/*.js', 'components/**/*.js', 'contexts/**/*.js', 'hooks/**/*.js'],
      rules: {
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'react-hooks/rules-of-hooks': 'error'
      }
    },
    {
      // Server-side layers: relax unused vars to reduce false positives in logging/migration scripts
      files: ['server/**/*.js'],
      rules: {
        'no-unused-vars': 'off'
      }
    },
    {
      // Tests and migrations: fully disable noisy rules
      files: ['server/test/**/*.js', 'server/tests/**/*.js', 'server/migrations/**/*.js', '__tests__/**', 'tests/**'],
      rules: {
        'no-unused-vars': 'off',
        'no-useless-escape': 'off',
        '@next/next/no-img-element': 'off',
        '@next/next/no-html-link-for-pages': 'off',
        'react-hooks/exhaustive-deps': 'off'
      }
    }
  ]
};
