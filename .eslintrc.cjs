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
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    'prefer-const': 'error',
    'react/no-unescaped-entities': 'off',
    '@next/next/no-page-custom-font': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  overrides: [
    {
      // Ignore lint errors in legacy/automation scripts
      files: ['automation/**/*.js', 'tools/**/*.js', 'backups/**/*.js', 'assets/products/**/*.js'],
      rules: {
        'no-useless-escape': 'warn',
        'no-unused-vars': 'warn',
        'no-inner-declarations': 'warn'
      }
    },
    {
      // Core application files - stricter rules
      files: ['pages/**/*.js', 'components/**/*.js', 'contexts/**/*.js', 'hooks/**/*.js', 'server/**/*.js'],
      rules: {
        'no-unused-vars': 'error',
        'react-hooks/rules-of-hooks': 'error'
      }
    }
  ]
};