/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    eqeqeq: ['error', 'always'],
    curly: ['warn', 'multi-line'],
    '@next/next/no-img-element': 'warn',
    'react/no-unescaped-entities': 'warn',
  },
  ignorePatterns: ['dist', '.next', 'node_modules'],
};
